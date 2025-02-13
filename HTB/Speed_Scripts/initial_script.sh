#!/bin/bash

sudo bash -c "echo '$2 $1' >> /etc/hosts"

tmux split-window -h
tmux send-keys "nmap -sV -sT -oN nmap_initial $2 -p "

tmux select-pane -t 0
nmap $2
