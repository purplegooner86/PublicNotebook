# HMAC
Hash Message Authentication Code  

Specific type of message authentication code (MAC) involving a crypotgraphic hash function and a secret key  

Involves a secret key K and a message M  
The message M consists of multiple blocks of b bits, 
for example, for SHA512, each block is 1024 bits, for SHA256 each block is 512 bits  

So, for SHA512, b would be 1024 bits  
The key, K is padded with 0s to b bits  
Then, the padded key is xor'd with ipad which is the constant 0x36363636...  
The result of this is S1, which is prepended to the message M  

The entire message, is then hashed, to produce an n bit hash value H(S1 || M)  
This value is then padded to b bits  

The key K, is once again padded with 0s to b bits  
Then, the padded key is xor'd with opad, which is the constant 0x5c5c5c5c...  
The result is S0, which is prepended to the padded H(S1 || M)  

The entire message, is again hashed, to produce an n-bit hash value HMAC(K, M)
