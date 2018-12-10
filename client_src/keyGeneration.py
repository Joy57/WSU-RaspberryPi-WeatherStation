from Crypto.PublicKey import RSA 
from Crypto.Cipher import PKCS1_OAEP

#Used to generate Privaate + Public Keys
#TO change to RSA 256 change 1024 to 2048

rsa_key = RSA.generate(1024) 
private_key = rsa_key.exportKey()
public_key = rsa_key.publickey().exportKey()
fPub = open("1024public.pem","wb")
fPub.write(public_key)
fPub.close()
fPriv = open("1024private.pem","wb")
fPriv.write(private_key) 
fPriv.close()



