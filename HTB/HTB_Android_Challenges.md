# Hack The Box Android Challenges

## Setup

Download android studio tar from developer.android.com  
unpack the tar, run `android-studio/bin/studio.sh`

Download Jadx:  
`git clone https://github.com/skylot/jadx.git`  
`cd jadx`  
`./gradlew dist`  
`build/jadx/bin/jadx-gui` to run  

Get zipalign and apksigner:  
`sudo apt install apksigner zipalign`  

## HTB - APKrypt

Getting around the 'please select an APK' issue was a massive pain in the ass  
The solution was to right click the module > open module settings, and change the Module SDK:  
Then I had to delete the API 28 emulator and essentially re-create it  

We use jadx to look at the Java source  
The md5 hash of our password is being compared to a set hash  
We can make changes to the apk using apktool  

`sudo apt install apktool` gives you apktool version 2.4.0-dirty, which has caused me problems  
Instead, just download apktool_2.4.1.jar from the internet and run with `java -jar apktool_2.4.1`  
I uninstalled apktool and aliased apktool appropriately  

`apktool d APKrypt.apk` disassembles the apk into a form we can edit  
I just changed the hash check to check against the result of `echo -n "admin" | md5sum`  
`apktool b APKrypt.apk -o modapp.apk` recompiles the apk  

Was getting a build error on the recompilation. Had to use the `--no-res` flag to get it to work  

Realign and resign the apk:  
`zipalign -p 4 modapp.apk modapp_align.apk`  
`keytool -genkey -v -keystore name.keystore -alias modapk -keyalg RSA -keysize 2048 -validity 10000`  
`apksigner sign --ks name.keystore modapp_align.apk`  

## HTB - APKey

This is literally almost the exact same challenge as APKrypt but slightly simpler  
The steps are exactly the same  