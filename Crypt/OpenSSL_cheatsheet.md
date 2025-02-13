# OpenSSL Cheatsheet

## RSA Keys

Generate 2048-bit RSA Private Key and save as KEY1.pem:  
`openssl genrsa -out KEY1.pem 2048`  

Generate 4096-bit RSA Private Key, encrypted with AES128:  
`openssl genrsa -out KEY2.pem -aes128 4096`  

- Key size must be the last argument of the command
- Omit `-out` argument to output to stdout  
- Other encryption algorithms are supported: `-aes128 -aes192 -aes256 -des3 -des`  

## Inspecting RSA Key Files  

Converting an RSA Private Key into text:  
`openssl rsa -in KEY.pem -noout -text`  

Removing encryption from an RSA key file:  
`openssl rsa -in ENCRYPTED-KEY.pem -out KEY.pem`  

Encrypting an RSA Key file:  
`openssl rsa -in KEY.pem -aes128 -out ENCRYPTED-KEY.pem`  

- `-noout` means print only the text, not the b64 encoded stuff  

## DSA Keys

Generate DSA Parameters File:  
`openssl dsaparam -out DSA-PARAM.pem 1024`  

Generate DSA Keys file with Parameters file:  
`openssl gendsa -out DSA-KEY.pem DSA-PARAM.pem`  

Generate DSA Parameters and Keys in one file:  
`openssl dsaparam -genkey -out DSA-PARAM-KEY.pem 2048`  

## Inspecting DSA Parameters and Keys  

Inspecting DSA parameters file:  
`openssl dsaparam -in DSA-PARAM.pem -text -noout`  

Inspecting DSA Private Key file:  
`openssl dsa -in DSA-KEY.pem -text -noout`  

## Elliptic Curve Keys

Generate EC Parameters file:  
`openssl genpkey -genparam -algorithm EC -pkeyopt ec_paramgen_curve:secp384r1 -out EC-PARAM.pem`  

Generate EC Keys from Parameters file:  
`openssl genpkey -paramfile EC-PARAM.pem -out EC-KEY.pem`  

Generate EC Keys directly:  
`openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-384 -out EC-KEY.pem`  

View supported Elliptic Curves:  
`openssl ecparam -list_curves`  

## Inspecting EC Parameters and Keys

Inspecting EC Parameters file:  
`openssl ecparam -in EC-PARAM.pem -text -noout`  

Inspecting EC Private Key file:  
`openssl ec -in EC-KEY.pem -text -noout`  

## pkey
openssl `pkey` utility allows you to inspect any type of key -> there are some flags it cannot do though