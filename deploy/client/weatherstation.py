import os
import time
import json
import sys
import requests
import datetime
import yaml
from pathlib import Path
from textstorage import TextStorage
from sensors import Sensors

class Client(object):
    WAIT_TIME = 4.86

    def main(self):
        if getattr(sys, 'frozen', False):
            configFile = Path(os.path.dirname(sys.executable) + "/config.yaml")
        else:
            configFile = Path(os.path.dirname(os.path.abspath(__file__)) + "/config.yaml")
        with open(str(configFile), 'r') as stream:
            try:
                config = yaml.load(stream)
            except yaml.YAMLError as exc:
                print(exc)

        self.URL = "http://" + str(config['server']['host']) + ":" + str(config['server']['port']) 
        self.apikey = self.getApiKey()
        textStorage = TextStorage(self.URL)
        sensors = Sensors()
        sensors.initializeSensors()

        # Continuously loop
        while True:
            # Construct our weatherdata json object
            weatherdata = sensors.getSensorData(self.apikey)

            try:
                r = requests.post(self.URL + '/api/weather', data = weatherdata)
                if (r.status_code == 200):
                    textStorage.sendWeather()
                    print("Sent: " + json.dumps(weatherdata))
                elif (r.status_code == 400):
                    print("Invalid API key")
            # Exception if unable to connect to server for the post request
            except (requests.exceptions.ConnectionError):
                print("Lost connection to server...storing data locally.")
                textStorage.storeWeather(weatherdata)
                pass

            # Wait 3 seconds before restarting the loop
            time.sleep(self.WAIT_TIME)
    
    # Get the API key for server requests
    # TODO: Encrypt the key in the file so it is not accessible
    def getApiKey(self):
        if getattr(sys, 'frozen', False):
            keyFile = Path(os.path.dirname(sys.executable) + "/.api-key.txt")
        else:
            keyFile = Path(os.path.dirname(os.path.abspath(__file__)) + "/.api-key.txt")

        # If the file already exists read from it
        if keyFile.is_file():
            with open(str(keyFile), 'r') as f:
                key = f.readline()
            return key

        # If the file doesn't exist, ask for user input and verify that the key is usable
        else:
            verified = False
            while(not verified):
                try:
                    key = raw_input("Enter your API key: ")
                except:
                    key = input("Enter your API key: ")
                key = "".join(key.split())
                try:
                    print("Verifying key...")
                    r = requests.post(self.URL + '/api/weather/verifyKey', data = {"apikey": key, "time": datetime.datetime.utcnow()})
                    if (r.status_code == 200):
                        print("Key Verified.")
                        f = open(str(keyFile), 'w')
                        f.write(key)
                        f.close()
                        verified = True
                    elif (r.status_code == 400):
                        print("Invalid API key. Please try again.")
                    elif (r.status_code == 409):
                        print("API key already taken. Please try again with an unused API key.")
                    else:
                        print("Something went wrong with the server.")
                except:
                    print("Lost connection to server.")
                    pass

        return key

if __name__ == '__main__':
    try:
        Client().main()

    except(KeyboardInterrupt, SystemExit):
        print("\nKilling Thread...")
