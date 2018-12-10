import requests
import os
import time
from getOldest import oldest
from pycryptoDecrypt import decrypt
from alert import alertSMS
from weatherapi import appending, appendingAnalysis
from verifyKey import verifyKey

#Posting method to the server
counter = 0
while True: 
        urlP = "https://3d08vv8lmh.execute-api.us-east-1.amazonaws.com/final/sensordata"
        headersP = {"X-API-Key":"fQ5qCZyiul4O6BPKjWs7k2wtD2g5giHr7IbvuBJN"}
        old = oldest()
        sizeFile = os.stat(old).st_size
        if (sizeFile != 128):
                os.remove(old)
                print("File not 128Bytes. Removed.")
        else:
                if counter != 3:
                        dataP = decrypt(oldest())
                        verifyKey(dataP)
                        posted = appending(dataP)
                        print("Posted data is: ",posted)
                        alertSMS(dataP)
                        post = requests.post(url = urlP, headers = headersP, data = posted)
                        counter = counter+1
                else:
                        dataP = decrypt(oldest())
                        verifyKey(dataP)
                        posted = appendingAnalysis(dataP)
                        print("Posted data is: ",posted)
                        alertSMS(dataP)
                        post = requests.post(url = urlP, headers = headersP, data = posted)
                        counter = 0
                        time.sleep(2)
                        
        if (post.status_code == 200):
            print("Data Sent.")
            os.remove(old)
        elif (post.status_code == 400):
            print("Invalid Please try again.")
        elif (post.status_code == 409):
            print("Messed up.")
        else:
                print("Something went wrong with the server.")
