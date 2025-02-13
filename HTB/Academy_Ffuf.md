# Academy - Attacking Web Applications with Ffuf

Installation: `sudo apt install ffuf`  

## SecLists

Seclists Github repo has some good wordlists, but the repo is 2.5 GB
Instead of cloning that, will selectively pull wordlists from there throughout the module  

As an example, to pull a wordlist `/SecLists/Discovery/Web-Content/web-extensions.txt` the following wget command would work (note the additon of "master"):  
`wget https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/web-extensions.txt`  

Should remove the comments from the top of these wordlists as they cause problems.  

<br />

## Directory fuzzing

```
ffuf -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt:FUZZ -u http://hello.htb:8080/FUZZ
```
The `FUZZ` keyword goes where the directory would go in the url  

<br />

## Page fuzzing

### Extension Fuzzing
We can fuzz for the page `index` with a bunch of different extensions with:  
```
ffuf -w /usr/share/wordlists/SecLists/Discovery/Web-Content/web-extensions.txt:FUZZ -u http://something.htb:8080/indexFUZZ
```

**Important Note:** Pay attention to the format of what is in the wordlist. For example, in this case, web-extensions.txt lists the extensions with the '.' in front of them. So doing `index.FUZZ` would not yield the correct results.  

### Page Fuzzing

Example: we know that pages will end in `.php`:
```
ffuf -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-2.3-small.txt:FUZZ -u http://something.htb:8080/blog/FUZZ.php
```

**Note**:  You can also just use the `-e` flag to specify extensions to look for

<br />

## Recursive Fuzzing

When we scan recursively, a new scan will automatically be started under any newly identified directories.  

Example:  
```
ffuf -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-2.3-small.txt:FUZZ -u http://something.htb:8080/FUZZ -recursion -recursion-depth 1 -e .php -v
```  
`-recursion-depth 1` means recursively scan the first level of directories

ffuf will continue/finish running the fuzz of the parent directory first before it proceeds to fuzzing the children directories. Once a child directory has been found, you can change this by pressing `[enter]` to get to the menu, and then running `queueskip` to move to the next job.  

<br />

## Subdomain Fuzzing (DNS)

```
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ -u https://FUZZ.something.com:8080
```

**Note:** that is using DNS to lookup subdomains, which is not the same as vhost fuzzing (which is what we always use for htb boxes)

<br />

## Vhost Fuzzing

### Vhosts vs Subdomains

A Vhost is basically a 'sub-domain' served on the same server and with the same ip, such that a single ip can be serving multiple websites.  

Vhosts may or may not have public DNS records.  

To scan vhosts, without manually adding every entry in a wordlist to our `/etc/hosts` we fuzz HTTP headers, specifically the `Host: ` header. To do so, we use the `-H` flag to specify a header, and fuzz the contents of the header.  

Like so:  
```
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ -u http://something.htb:PORT/ -H 'Host: FUZZ.something.htb'
```

<br />

## Filtering Results  

Ffuf provides the option to match or filter out a specific HTTP code, response size, or amount of words.  

A lot of times we know what the size of an incorrect response is, and we can filter that out with the `-fs` flag  

ie:  
```
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ -u http://something.htb:PORT/ -H 'Host: FUZZ.something.htb' -fs 900
```

<br />

## Parameter Fuzzing - GET  

```
ffuf -w /usr/share/wordlists/SecLists/Discovery/Web-Content/burp-parameter-names.txt:FUZZ -u http://admin.academy.htb:31367/admin/admin.php?FUZZ=key
```

In this example, everything returned a positive result with Status: 200, so we need to use size filtering (the `-fs`) flag. In this case, re-running the command with `-fs 798` (once we determined that was the size of these false positives) was the way to go  

<br />

## Parameter Fuzzing - POST  

Unlike GET requests, POST requests are not passed with the URL, and cannot simply be appended after a `?` symbol. POST requests are passed within the data field within the HTTP request.  
To fuzz the data field with ffuf we use the `-d` flag.  

Example:  
```
ffuf -w /usr/share/wordlists/SecLists/Discovery/Web-Content/burp-paramter-names.txt:FUZZ -u http://admin.academy.htb:31367/admin/admin.php -X POST -d 'FUZZ=key' -H 'Content-Type: application/x-www-form-urlencoded'
```

As with GET fuzzing, we need to run this twice, and add a `-fs` flag on the second run to filter the false positives that come back  

<br />

## Value Fuzzing

This usually occurs after fuzzing a working parameter; we need to fuzz values for that parameter to find ones of interest.  

A lot of times we may need to create a custom wordlist to fuzz values based on what we think that value might be based on our understanding of the parameter.  

For example, if the parameter is `id` we could create a custom wordlist of the integers 0-1000 to fuzz that parameter with, using the following:  
`for i in $(seq 1 1000); do echo $i >> ids.txt; done`  

Once we have our custom wordlist, we can run the following to fuzz values for the id parameter in a POST request:  

```
ffuf -w ids.txt:FUZZ -u http://admin.academy.htb:31367/admin/admin.php -X POST -d 'id=FUZZ' -H 'Content-Type: application/x-www-form-urlencoded'
```

Again, we will need to add `-fs` with a size and run again  

<br />

## Skills Assesment

The skills assesment for this one sort of just repeated what we did in each of the modules  

The one interesting part was the final value fuzzing, where we had to use a usernames wordlist:  

```
ffuf -w xato-net-10-million-usernames.txt:FUZZ -u http://faculty.academy.htb:30146/courses/linux-security.php7 -X POST -d 'username=FUZZ' -H 'Content-Type: application/x-www-form-urlencoded' -fs 781
```
