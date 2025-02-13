# HTB - Ellingson

## Summary

This is a relatively hard retired box  
It starts with a relatively simple webex to get ssh access as a low-priv user  
Then, there is a hash-cracking to get a lateral privesc to a different user  
Finally, the main part of the exploit is the binex of a no stack exec setuid binary in an ASLR enabled enviroment to privesc to root  

<br />

## Webex

nmap reveals the box is hosting a website on http and that ssh is enabled  
Each of the articles on the web page are at `http://10.10.10.139/articles/x` where x is a number 1-3  
Attempting to access article 4 brings up a Werkzeug Python Debugger  
Werkzeug is a Python library that provides various utilities for Web Server Gateway (WSGI) applications  
WSGI is a specification that defines how a webserver (like NGINX) communicates with a Python web application  
By running a test python command in the debugger shell like `os.listdir()` we immediately see that we can run python commands  
`os.listdir('/home')` reveals a list of users: 'margo', 'duke', 'hal', 'theplague'  
`os.listdir('/home/hal')` is the only one where we have permissions to do so  
Knowing that we have access to hal's home directory, we can `os.listdir('/home/hal/.ssh')`  
From there, we can drop our own ssh public key into the `/home/hal/.ssh/authorized_keys directory` with python:  
`with open('/home/hal/.ssh/authorized_keys', 'a') as f: f.write('\nssh-rsa ...<ssh key contents>... purple@kali')`  
Now, we can ssh using the private key:  
`ssh -i ~/id_rsa_generated hal@10.10.10.139`

<br />

## Lateral Privesc

Running `id` we notice that hal is in the `adm` group:
uid=1001(hal) gid=1001(hal) groups=1001(hal), 4(adm)  
According to the Debian documentation:  
Group adm is used for system monitoring tasks. Members of this group can read many log files in /var/log and can use xconsole  

We can see what all of the files owned by this group are with:  
`find / -group adm 2>/dev/null`  
We see an interesting looking file called `/var/backups/shadow.bak`  
This file appears to contain the hashes of the passwords for each of the users on the box  

**Cracking Hashes**  
Attempting to crack the hashes with hashcat wasn't making much progress:  
`hashcat --example-hashes | grep -F '$6$' -B 1`  
These `$6$` hashes are sha512 and very hard to break

There is a hint on the front of the website talking about common passwords with "Love, Secret, Sex, and God"  
Creating a custom word list with case insensitive (-i) grep and rockyou:  
`grep -i -e love -e secret -e sex -e god /usr/share/wordlists/rockyou.txt > grepped_rockyou`  
Using hashcat with this new wordlist gives a match:  
`hashcat -m 1800 shadow.bak grepped_rockyou --force`  
margo's password is `iamgod$08`

With this password we can ssh to the box as margo  

<br />

## Privesc to Root

We find a suid binary that looks interesting:  
`find / -perm -4000 -type f -ls 2>/dev/null | head`  
/usr/bin/garbage  
This binary asks for a password as input and spits back an output  
First we check if ASLR is enabled on the box: `cat /proc/sys/kernel/randomize_va_space` it is  
We can pull the binary off the box with scp, and examine it in Ghidra and gef to identify potential vulnerabilites  
Running checksec in gef shows us that `nostackexec` is enabled, but the other protections are not  

In Ghidra, we immediately see that this binary will be vulnerable to a buffer overflow  
The buffer overflow attack on this binary is very similar to the one I go over in BinaryExploitation>defeatASLR  
Basically we will follow the same exact steps I layout in that example  

We do have a few extra steps however:  
We will need to find the offset of `setuid()` in libc and call it with 0x0 as the parameter in rdi for the setuid bit to be preserved and our shell to be a root shell  
We also will need to send the exploit over ssh with pwntools  

That's it! We get a shell as root  