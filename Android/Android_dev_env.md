# Android Development Environment

## Android Studio Installation

Install Dependencies:
- `sudo apt-get install libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1 libbz2-1.0:i386`  

Download Android Studio  
Run `bin/studio.sh`  

<br />

## Hello World Kotlin Android App

Create a new project, use the "Empty Activity" option  
The default configuration values should actually have Kotlin as the default language, so no need to change anything there  
Right click the res folder, click new > directory, name it layout  
Right click the layout folder, click new > XML > Layout XML File. name it activity_main  
When you open this new file, a UI design view should be presented  

### Building the APK:

Click Build > Build Bundle(s)/APK(s) > Build APK(s)  
When Android Studio is done building the APK, a popup will show up in the lower right, after which you can click `locate`, to be taken to the filesystem location of the APK  

<br />

## Setting up Frida

Install Frida on local host:  
- `python3 -m pip install frida-tools`  
- `export PATH=$PATH:/home/user/.local/bin`
- Get Frida version: `frida --version`  

Download a frida-server for target architecture (`adb shell "uname -m"`) from the Frida github releases page  
The Major version of the Frida server must match the major version from `frida --version`  
Extract the tar  

Get frida-server running on the emulator:  
- `adb push frida-server /data/local/tmp`
- `adb shell "chmod 755 /data/local/tmp/frida-server"`
- `adb shell "/data/local/tmp/frida-server &"`
    - You will need to `ctrl+c` this command, but it is running
- `frida-ps -Ua` to verify we are connected to frida-server  



