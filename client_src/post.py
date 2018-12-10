import requests
import os
import time
from getOldest import oldest
from pycryptoDecrypt import decrypt
from alert import alertSMS
from weatherapi import appending
from verifyKey import verifyKey

#Posting method to the server

while True: 
        urlP = "AWS Endpoint"
        headersP = {"X-API-Key":"AWS X-API-Key"}
        old = oldest()
        sizeFile = os.stat(old).st_size
        if (sizeFile != 128):
                os.remove(old)
                print("File not 128Bytes. Removed.")
        else:
                dataP = decrypt(oldest())
                verifyKey(dataP)
                posted = appending(dataP)
                print("Posted data is: ",posted)
                alertSMS(dataP)
                post = requests.post(url = urlP, headers = headersP, data = posted)
                        
        if (post.status_code == 200):
            print("Data Sent.")
            os.remove(old)
        elif (post.status_code == 400):
            print("Invalid Please try again.")
        elif (post.status_code == 409):
            print("Messed up.")
        else:
                print("Something went wrong with the server.")
