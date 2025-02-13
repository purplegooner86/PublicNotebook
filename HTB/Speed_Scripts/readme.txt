init_script.sh is meant to be run right away like so:
./init_script.sh something.htb 10.11.166.4
It will add an entry to /etc/hosts, start a basic nmap scan, and set you up for a follow-on nmap scan in a second terminal pane

fast_web_enum.sh is meant to be run if the target is found to be hosting a web server like so
./fast_web_enum.sh something.htb 80
where 80 is the port the webserver is running on in this case
It will spawn a 4-pane tmux window with a ffuf dir fuzz in the top left, a ffuf vhost fuzz in the top right, and a nikto scan in the bottom left
