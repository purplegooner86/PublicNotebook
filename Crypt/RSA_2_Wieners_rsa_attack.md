# Wieners RSA Attack

## RSA Review

An RSA public key consists of two integers: an exponent e and a modulus N.  
N is the product of two randomly chosen prime numbers p and q  
The private key, d, is the decryption exponent:  
d = e<sup>-1</sup> % (p-1)(q-1)  
Note: (p-1)(q-1) is often written as phi(N), aka Euler's totient function  

There is some math that exists, which allows us to say:  
(p - 1)(q - 1) = (ed - 1) / k  
for some integer k  

If an attacker has an educated guess of what k and d are, they could compute (p-1)(q-1)  

## The Attack  
1) Generate a vulnerable RSA keypair ( one with a short private exponent (d < (1/3)N<sup>(1/4)</sup>) )
2) Find the convergents of the continued fraction expansion of e/N  
3) Iterate throught the convergents  