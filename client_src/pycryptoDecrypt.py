from Crypto.Cipher import PKCS1_OAEP 
from Crypto.PublicKey import RSA

#Used to decrypt the encrypted Weather Data File. Decryption will be using RSA 1024
def decrypt(fileName): 
    encrypted = open(fileName,"r+b") 

    decKey = RSA.importKey(open("/home/pi/Desktop/weather-station-master/client/1024private.pem",'r').read())
    decrypted = PKCS1_OAEP.new(decKey)
    dec_rsa = decrypted.decrypt(encrypted.read()) 
    print(dec_rsa)

    encrypted.seek(0)
    encrypted.truncate()
    encrypted.write(dec_rsa)
    encrypted.close()
    
    return dec_rsa 



