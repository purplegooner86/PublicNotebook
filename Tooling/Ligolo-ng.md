# Ligolo-ng

## Overview

Ligolo-ng is a tunneling tool written in Go  

Ligolo establishes tunnels from a reverse TCP/TLS connection using a tun interface, without the need of SOCKS  

SOCKS is a layer 5 redirector. So this means that SOCKS is redirecting application protocols, like HTTP, SMTP, etc...  

What happens if we want to redirect layer 4 plain TCP/UDP? or IP packets (layer 3)? SOCKS can't do it  

Ligolo creates a full userland network stack, meaning it is a layer 3 redirector  

## Connecting

The **proxy** component of Ligolo goes on the attack box  

The **agent** component of Ligolo goes on the target  

In this configuration, traffic coming out of the proxy box, destined for an IP address that is routable from the agent box, will be routed through the agent box, into the agent box's network  


```sh
# On proxy box:
sudo ip tuntap add user purple mode tun ligolo
sudo ip link set ligolo up
./proxy -selfcert

# On agent box:
./agent -connect 192.168.56.110:11601 -ignore-cert
```

## Basic Proxy Usage

```sh
# use a session:
session
# type 1, or whatever the session number is
# On attack box:
sudo ip route add 172.16.5.0/24 dev ligolo
# In ligolo console:
start
```

## Building

```sh
# Go > 1.20 is required

git clone https://github.com/nicocha30/ligolo-ng.git
cd ligolo-ng
go build -o agent cmd/agent/main.go
go build -o proxy cmd/proxy/main.go
```

### **Building for Windows**

```sh
GOOS=windows go build -o agent.exe cmd/agent/main.go
```

### **Building for 32-bit**

I had a 32-bit target running linux. This is how I built ligolo-ng agent to work on that target. I still used the 64-bit version of the proxy on my attack box:  

### **Building Agent for Alpine**

```sh
CGO_ENABLED=0 go build -o agent cmd/agent/main.go
```

```sh
GOOS=linux GOARCH=386 go build -o agent cmd/agent/main.go
```

<br />

## Running Proxy on Windows

You need to download the Wintun driver (used by WireGuard) and place the wintun.dll in the same folder as Ligolo  

Then, its simple:  
Build:
- `go build -o proxy.exe cmd/proxy/main.go`

No need to do any tuntap stuff, just `.\proxy.exe -selfcert` in a **Administrator** powershell window  

When you run `start` in a session, an interface will be created  

Adding route to interface in PowerShell:  
```Powershell
# get ifIndex:  
Get-NetAdapter
# ligolo ... ifIndex: 22

# Add the route
New-NetRoute -DestinationPrefix 172.16.5.0/24 -InterfaceIndex 22
```


