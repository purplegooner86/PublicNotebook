# HTB - Support

## Summary

This is a Windows AD/Domain Controller one. I was paying very little attention for this, so this writeup is mostly just going to be a summary of the tools I used

## User

We download an exe from an SMB share  
We can run the exe on Linux with mono. Mono is an open source implementation of Microsoft's .NET framework.  
Using Mono, we discover some WinRM credentials  
We can use evil-winrm to connect with these WinRM credentials  
Installing evil-winrm:  
`sudo apt install ruby-dev`  
`sudo gem install evil-winrm`  
Then:  
`evil-winrm -u USER -p PASSWORD -i IP_ADDRESS_HERE`  

## Root

First we use BloodHound and SharpHound to look for AD permission and misconfiguration weaknesses  
Then, we use Powermad to add a new fake computer to AD and give the fake computer Constrained Delegation privlege  
Then, we use Rubeus to generate password hashes for the fake computer  

Then we use getST.py and smbexec.py from impacket to get a semi-interactive shell as an admin  