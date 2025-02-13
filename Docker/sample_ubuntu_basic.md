# Sample Basic Ubuntu Dockerfile

```Dockerfile
# Specify the base image
FROM ubuntu:22.04

RUN apt-get update

# -y tells apt-get to assume "yes" as response to all prompts
RUN apt-get install -y locales locales-all
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en

RUN apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    sudo \
    vim \
    build-essential \
    file

# -m means 'create a home directory'
# GFD's password will be 'GFD'
RUN useradd -m GFD && echo "GFD:GFD" | chpasswd && adduser GFD sudo

WORKDIR /home/GFD
```
