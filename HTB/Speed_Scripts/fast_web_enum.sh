#!/bin/bash

tmux new-window -t $SESSION:9 -n 'WebEnum'
tmux split-window -h
tmux split-window -v 
tmux select-pane -t 0
tmux split-window -v

tmux select-pane -t 0
tmux send-keys "ffuf -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt:FUZZ -u http://$1:$2/FUZZ -e .php,.html" C-m

tmux select-pane -t 2
tmux send-keys "ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ -u http://$1:$2/ -H 'Host: FUZZ.$1'" C-m

tmux select-pane -t 1
tmux send-keys "nikto -host $1 -port $2" C-m

tmux select-pane -t 3
