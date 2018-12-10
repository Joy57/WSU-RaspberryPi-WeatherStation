import os
import time
import json
import sys
import requests
import datetime
import yaml
import psutil
from pathlib import Path
from textstorage import TextStorage
from sensors import Sensors


class Client(object):
    WAIT_TIME = 4.86

    def main(self):
        start_time = time.time() 
        cpu_usage = psutil.cpu_percent()

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
            cpu_usage = psutil.cpu_percent()
            ram = psutil.virtual_memory()
            ram_usage = ram.percent
            #bat = format_time(time.time() - start_time)
            weatherdata = sensors.getSensorData(self.apikey,cpu_usage,ram_usage)

               # pass
            #time.sleep(4)
            #try:
                #r = requests.post(self.URL + '/api/weather', data = serv1)
                #if (r.status_code == 200):
                  #  textStorage.sendWeather()
                   # print("Sent: " + json.dumps(serv1))
               # elif (r.status_code == 400):
                  #  print("Invalid API key")
            # Exception if unable to connect to server for the post request
            #except (requests.exceptions.ConnectionError):
                #print("Lost connection to server...storing data locally.")
               # textStorage.storeWeather(serv1)
              #  pass

            

            
            #The above commented code is the way previous semester posted to the server. We no longer need that because each individual Pi will not be posting anymore, and only Master will post. 
            #Because of that, each Pi needs to store their data locally and broadcast via LoRa to Master.
            print("Lost connection to server...storing data locally.")
            textStorage.storeWeather(weatherdata)
           
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
                
                #Below is the way how previous semester Verfied an API Key. it is no longer needed cause Master should verify all api keys before posting. 
                #This method below makes each servant Pi Verfiy on its own. 

                #try:
                    #print("Verifying key...")
                   # r = requests.post(self.URL + '/api/weather/verifyKey', data = {"apikey": key, "time": datetime.datetime.utcnow()})
                    #if (r.status_code == 200):
                     ##   print("Key Verified.")
                        #f = open(str(keyFile), 'w')
                        #f.write(key)
                        #f.close()
                       # verified = True
                   # elif (r.status_code == 400):
                   #     print("Invalid API key. Please try again.")
                  #  elif (r.status_code == 409):
                  #      print("API key already taken. Please try again with an unused API key.")
                  #  else:
                   #     print("Something went wrong with the server.")
               # except:
                  #  print("Lost connection to server.")
                 #   pass
                f = open(str(keyFile), 'w')
                f.write(key)
                f.close()
                verified = True
        return key

        #Function to get time. Format Seconds into Hr:Min:Sec
def format_time(seconds):
        hours = seconds // (60*60)
        seconds %= (60*60)
        minutes = seconds // 60
        seconds %= 60
        return "%02i:%02i:%02i" % (hours, minutes, seconds)

if __name__ == '__main__':
    try:
        Client().main()

    except(KeyboardInterrupt, SystemExit):
        print("\nKilling Thread...")
