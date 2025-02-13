# RSA and Chinese Remainder Theorem

## Theorem

**Chinese Remainder Theorem**  
Given pairwise coprime positive integers *n<sub>1</sub>, n<sub>2</sub>, ..., n<sub>k</sub>*, and arbitrary integers *a<sub>1</sub>, a<sub>2</sub>, ..., a<sub>k</sub>*, the system of simultaneous congruences:  
&emsp;&emsp;x $\equiv$ a<sub>1</sub> (mod n<sub>1</sub>)  
&emsp;&emsp;x $\equiv$ a<sub>2</sub> (mod n<sub>2</sub>)  
&emsp;&emsp;...  
&emsp;&emsp;x $\equiv$ a<sub>k</sub> (mod n<sub>k</sub>)  
has a solution, and the solution is unique modulo N = n<sub>1</sub> * n<sub>2</sub> * ... * n<sub>k</sub>  

**Terms Explanation**:  
Example system of linear congruences:  
&emsp;&emsp;x $\equiv$ 3 (mod 5)  
&emsp;&emsp;x $\equiv$ 1 (mod 7)  
&emsp;&emsp;x $\equiv$ 6 (mod 8)  

What this system is saying is "x divided by  5 has a remainder of 3, x divided by 7 has a remainder of 1, x divided by 8 has a remainder of 6"  
The moduli (5, 7, and 8) are relatively prime, so the CRT tells us that there is a solution x, and that solution is unique modulo 5\*7\*8 (=280)  
In this example, the solution is 78.  

## Attacking RSA with CRT

In the case where three people have the following public keys: (n<sub>1</sub>, 3), (n<sub>2</sub>, 3), (n<sub>3</sub>, 3)  
e=3 for all three people, and the same message is sent to all three people, them we have the following system:  
&emsp;&emsp; c<sub>1</sub> = m<sup>3</sup> mod n<sub>1</sub>  
&emsp;&emsp; c<sub>2</sub> = m<sup>3</sup> mod n<sub>2</sub>  
&emsp;&emsp; c<sub>3</sub> = m<sup>3</sup> mod n<sub>3</sub>  

Let x = m<sup>3</sup> then, using CRT x = m<sup>3</sup> mod n<sub>1</sub> * n<sub>2</sub> * n<sub>3</sub>  
If m \< n<sub>1</sub>, n<sub>2</sub>, and n<sub>3</sub>, then m<sup>3</sup> \< n<sub>1</sub> * n<sub>2</sub> * n<sub>3</sub>, meaning m<sup>3</sup> mod n<sub>1</sub> * n<sub>2</sub> * n<sub>3</sub> will just equal m<sup>3</sup> meaning we can just take the cube root  
We solve for m<sup>3</sup> using Chinese Remainder Theorem, and then take the cube root to get the original message  