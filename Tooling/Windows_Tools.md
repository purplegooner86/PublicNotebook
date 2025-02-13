# Windows Tools

Useful Linux tools for enumerating Windows

## smbclient

List all shares:
```sh
smbclient --user inlanefreight\\htb-student --list 10.129.201.234
```

Connect to a share:
```sh
# C$ is the name of the share: 
smbclient --user inlanefreight\\htb-student //10.129.201.234/C$
```

Upload a file:
```sh
smb: \Users\htb-student\> put /home/vagrant/ligolo-ng/windows_agent .\windows_agent
```
