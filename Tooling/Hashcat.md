# Hashcat

## Installation

This can be a major pain  

Would recommend downloading direct from hashcat, and not using `apt`
- https://hashcat.net/hashcat/

Installation:
```sh
# Download the binaries
# Unzip
sudo cp -r hashcat-6.2.6 /opt
sudo chmod -R 777 /opt/hashcat-6.2.6
sudo ln -s /opt/hashcat-6.2.6/hashcat.bin /usr/sbin/hashcat
hashcat -V
    # Should print the version
hashcat -b
    # Should run a benchmark test (with the Nvidia graphics card)
```


On a fresh install of Mint, with Nvidia drivers installed (using driver manager) I had no issues
