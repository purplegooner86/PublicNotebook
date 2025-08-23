# Getting Nvidia 5090 to Work

The biggest obstacle ended up being the UEFI configuration. This probably would have been a lot simpler if I just figured that out from the start. 

Has to be:
```
Advanced > PCI > Above 4G Decoding [ON]
Advanced > PCI > SR-IOV [ON]
Advanced > PCI > resizable BAR [OFF]
```

## Drivers

Do not have Ubuntu install the drivers for you on install. Uncheck the download additional device drivers option  

Then, do the steps here https://developer.nvidia.com/cuda-downloads yourself  

Add the cuda repo first and then use it to install the drivers  

I installed `nvidia-open` not `cuda-drivers`. I think for a 5090 that might be a requirement  


