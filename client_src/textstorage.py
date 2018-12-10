import os
import requests
import datetime
import sys
from pathlib import Path
from collections import OrderedDict
import time
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes
from Crypto.Cipher import AES, PKCS1_OAEP

# Class to handle weather storage on the client when no
# connection to the server can be made.
class TextStorage(object):
    DATA_DIR = "/data/"

    def __init__(self, url):
        self.url = url

    # Constuct our string of weather data to be printed into the file
    def constructWeatherString(self, weatherdata):
        index = 0
        data = ""
        for val in weatherdata:
            if (val != "data_index"):
                if (index == 0):
                    data = data + str(weatherdata[val]).replace('(', '').replace(')', '')
                else:
                    data = data + ", " + str(weatherdata[val]).replace('(', '').replace(')', '').replace(',', '').replace('\'', '')
            index += 1
        data = data + "\n"
        return data

    # Check if we have the data directory already. If we don't, make it
    def checkDataDirectory(self):
        if getattr(sys, 'frozen', False):
            dataDir = Path(os.path.dirname(sys.executable) + self.DATA_DIR)
        else:
            dataDir = Path(os.path.dirname(os.path.abspath(__file__)) + self.DATA_DIR)

        if dataDir.is_dir():
            return True
        else:
            os.makedirs(str(dataDir))
            return True

    # Store data in a text file if we are not connected to the internet or the server is down
    # TODO: Look into encrypting this data in storage
    def storeWeather(self, weatherdata):
        today = datetime.date.today()
        data = self.constructWeatherString(weatherdata)
        if(self.checkDataDirectory()):
            if getattr(sys, 'frozen', False):
                ts = time.gmtime()
                t = time.strftime("%Y-%m-%d %H:%M:%S", ts)
                file = Path(os.path.dirname(sys.executable) + self.DATA_DIR + t + ".txt")
            else:
                ts = time.gmtime()
                t = time.strftime("%Y-%m-%d %H:%M:%S", ts)
                file = Path(os.path.dirname(os.path.abspath(__file__)) + self.DATA_DIR + t + ".txt")
            if file.is_file():
                with open(str(file), 'a') as f:
                    f.write(data)
            else:
                f = open(str(file), 'w')
                f.write(data)
                f.close()
                f = open(str(file), 'r+b')
                key = RSA.importKey(open("public.pem","r").read()) 
                cipher_rsa = PKCS1_OAEP.new(key) 
                enc_file = cipher_rsa.encrypt(f.read())
                print("Encrypted file is: " , enc_file) 
                f.seek(0)
                f.truncate()
                f.write(enc_file)
                f.close()
        return
    
    # Read all data from a file and send in chunks of 7200 or until eof
    def readWeather(self, file):
        weatherdata = []
        lineIndex = 0
        # Iterate through each line of the file
        for data in file:
            colIndex = 0
            linedata = OrderedDict()
            linedata["created_at"] = ""
            linedata["apikey"] = ""
            linedata["temperature"] = ""
            linedata["humidity"] = ""
            linedata["pressure"] = ""
            linedata["latitude"] = ""
            linedata["longitude"] = ""

            # Strip the commas and whitespace from each line and set our data in an array
            data = data.rstrip('\n')
            data = [col.strip() for col in data.split(',')]

            # Iterate through the array of data and store in our linedata dictionary
            for col in linedata:
                linedata[col] = data[colIndex]
                colIndex += 1
            
            # Max number of rows in 1 day with data every 3 days is 28800
            # Send it in 4 chunks so 28800 / 4
            if (lineIndex == 7200): 
                try: 
                    r = requests.post(self.url + '/api/weather/offlineData', json=weatherdata)
                except (requests.exceptions.ConnectionError):
                    print("Lost connection to server...unable to send stored data.")
                    pass
                weatherdata = []
                lineIndex = 0
            
            # Under 7200 so just add onto our array of dictionaries
            else:
                weatherdata.append(linedata)
        
        return weatherdata

    # Send any stored weather data we may have left after reconnecting to the server
    def sendWeather(self):
        if getattr(sys, 'frozen', False):
            dataDir = Path(os.path.dirname(sys.executable) + self.DATA_DIR)
        else:
            dataDir = Path(os.path.dirname(os.path.abspath(__file__)) + self.DATA_DIR)

        if (dataDir.is_dir()):
            # Iterate through each existing file in our data directory
            for filename in os.listdir(str(dataDir)):
                # Open the file for reading
                with open(os.path.join(str(dataDir), str(filename)), 'r') as f:
                    weatherdata = self.readWeather(f)

                    # Send whatever we have left if it is less than 7200 lines of data
                    try:
                        r = requests.post(self.url + '/api/weather/offlineData', json=weatherdata)
                    except (requests.exceptions.ConnectionError):
                        print("Lost connection to server...unable to send stored data.")
                        pass
                    except (ex):
                        print(ex)
                # Remove the file once everything is sent over 
                os.remove(os.path.join(str(dataDir), str(filename)))