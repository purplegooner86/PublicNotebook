# Sample Ubuntu Pwning DockerFile

```DockerFile
# Specify the base image
FROM ubuntu:22.04

# support for 32-bit
RUN dpkg --add-architecture i386

RUN apt-get update

# -y tells apt-get to assume "yes" as response to all prompts
RUN apt-get install -y locales locales-all
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en

RUN apt-get install -y \
    tmux \
    zsh \
    unzip \
    python3 \
    python3-pip \
    python3-dev \
    sudo \
    vim \
    gdb \
    gdb-multiarch \
    build-essential \
    file

# Support for 32-bit
RUN apt-get install -y \
    libc6:i386 \
    libncurses5:i386

# -m means 'create a home directory'
# GFD's password will be 'GFD'
RUN useradd -m GFD && echo "GFD:GFD" | chpasswd && adduser GFD sudo

WORKDIR /home/GFD

# We want to run pip as user
RUN su - GFD -c "pip3 install --no-warn-script-location pwntools keystone-engine unicorn capstone ropper"

# Copy local files to the container
COPY configFiles.zip configFiles.zip

RUN unzip configFiles.zip

RUN mv configFiles/.gdbinit .
RUN mv configFiles/.gef .
RUN mv configFiles/.oh-my-zsh .
RUN mv configFiles/.tmux.conf .
RUN mv configFiles/.zshrc .
RUN mv configFiles/.vimrc .

RUN chown -R GFD:GFD .gef
RUN chown -R GFD:GFD .oh-my-zsh
RUN chown GFD:GFD .gdbinit
RUN chown GFD:GFD .tmux.conf
RUN chown GFD:GFD .zshrc
RUN chown GFD:GFD .vimrc

RUN rm configFiles.zip
RUN rm -rf configFiles
```