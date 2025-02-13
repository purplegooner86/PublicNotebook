# Oopsie

## Summary

This is a website based exploitation  
We modify cookies on the website to give ourselves access to an upload form  
We use the upload form to upload a php reverse shell file  
We then use gobuster to find where on the website the uploaded php reverse shell file is placed  
This enables us to get a reverse shell as the www-data user  
We find credentials for a lateral user robert  
Then, we use a root owned script with the SUID bit set to escalate our privledges and get a shell as root

## Enumeration

Our nmap scan reveals a port 80 open with http as well as port 22 for ssh  
Navigating to this site, and looking at the HTTP requests on reload with BurpSuite > Target we can see that there is a GET request to /cdn-cgi/login/?guest=true  
Navigating to /cdn-cgi we see that there is an option to login as guest  
Once we have logged in as guest, we can see ont the accounts tab that ?id=2 is being set in the url  
Changing this to ?id=1 gives us the access id of the admin user  
Using firefox dev tools (inspect element) in the storage tab, we can see that the site is using a cookie to track which user we are
We can change the user cookie's value to the admin access id and the role cookie to admin
This allows us access the uploads page

## Getting a Reverse Shell

We have a pre-built php reverse shell at `/usr/share/webshells/php/php-reverse-shell.php` which we can copy and edit with our tun ip address and a port of our choice  
Then, we can upload this file to the website using the upload form  
Now, we need to figure out where the website actually is storing uploaded files  
We can do this with gobuster:  
`gobuster dir -u http://10.129.95.226/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -x php`  
We find the /uploads directory  
We start a nc listener on our port: `nc -lvnp 4444`  
Now, when we access the url where our reverse shell php script is stored, we get a reverse shell  
We can upgrade the shell with:  
`python3 -c 'import pty;pty.spawn("/bin/bash")'`

## Lateral Movement

When we get user we are the user www-data, which can't acheive many things as the role has restricted access on the system  
Since the website is making use of PHP and SQL, we can further enumerate the web directory for potential disclosures or misconfigurations.  
After some search we can find some interesting php files under /var/www/html/cdn-cgi/login directory.  
We can `cat /etc/passwd` to find a list of users  
We see that there is a user robert  
Searching the login directory with `cat * | grep -i robert` we find the password for robert and can su to him

## Privlege Escalation

First, we check if robert has sudo access: `sudo -l` he does not  
Next, use `id` to see the groups which robert is a part of. We see that he is a part of the bugtracker group  
We can run `find / -group bugtracker 2>/dev/null` to find any binaries within that group  
We find the file `/usr/bin/bugtracker`  
We can check what privleges it has and what type of file it is: `ls -la /usr/bin/bugtracker && file /usr/bin/bugtracker`  
We see that the privleges (-rwsr-xr--) contain the setuid bit  
The SUID (Set owner User ID) bit has a single function: A file with SUID always executes as the user who owns the file, regardless of the user passing the command  
In our case, the binary is owned by root and we can execute it as root since it has SUID set  
Running the binary, we find that it reads user input, and runs the cat command on that input  
We can navigate to /tmp and create a file named cat with the following content: `/bin/sh`  
We will then set execute privleges: `chmod +x cat`  
In order to exploit this we can add the /tmp directory to the PATH enviroment variable: `export PATH=/tmp:$PATH`  
Check $PATH with `echo $PATH`  
Finally we execute bugtracker from the /tmp directory, and this gives us a root shell