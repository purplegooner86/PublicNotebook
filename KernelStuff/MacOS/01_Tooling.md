# Tooling

## Setup a MacOS Monterey VM in VirtualBox

Follow this tutorial:  
https://www.youtube.com/watch?v=L8otPMUL08g

I was hung on a `EBILOG:EXITBS:START` error when I tried to boot  
I had to run the following additional command to get around that:  
```sh
VBoxManage modifyvm "MacOSMonterey_Base" --cpu-profile "Intel Core i7-6700K"
````

