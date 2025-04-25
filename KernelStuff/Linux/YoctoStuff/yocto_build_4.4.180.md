# Building a Yocto 4.4.180 Kernel

Instructions for building a 4.4.180 Yocto kernel with the Poky build system  

<br />

## System Setup

This was done on a basically out-of-the-box Ubuntu 22.04 installation  
The build box should have plenty of free space, probably at least 60 gigs  

Disable app armor:
```sh
sudo vim /etc/default/grub
# add apparmor=0 to GRUB_CMDLINE_LINUX
sudo update-grub
# reboot
```

Apt packages:
```sh
sudo apt install build-essential chrpath cpio debianutils diffstat file gawk gcc git iputils-ping libacl1 liblz4-tool locales python3 python3-git python3-jinja2 python3-pexpect python3-pip python3-subunit socat texinfo unzip wget xz-utils zstd
```

Get poky:
```sh
git clone https://github.com/yoctoproject/poky.git
cd poky
git checkout styhead
```

Get Yocto:
- Download tarball of desired tag from https://web.git.yoctoproject.org/linux-yocto-4.4/refs/tags  


Get yocto-kernel-cache
- Download tarball of closest version from https://web.git.yoctoproject.org/yocto-kernel-cache


Unpack both tarballs and set them up as git repos:
```sh
# (for both)
git init .
git add *
git commit -m "initial commit"
```

Get poky ready:
```sh
cd poky
git checkout styhead
source oe-init-build-env

devtool create-workspace
cd workspace
mkdir -p recipes/linux-yocto-4.4.180
cd recipes/linux-yocto-4.4.180
touch linux-yocto-4.4.180.bb
# Start by referencing "morty" branch on Github
```

Get revision of `master` from both of your local repos:  
```sh
git rev-parse HEAD
```

