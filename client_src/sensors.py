import random
import datetime
import os
import subprocess
import sys
import yaml
import threading
from collections import OrderedDict
from pathlib import Path
try:
    import Adafruit_DHT
except:
    print("Adafruit DHT library not installed.")
    pass
try:
    import Adafruit_BMP.BMP280 as BMP280
except:
    print("Adafruit BMP library not installed.")
    pass
try:
    from sense_hat import SenseHat
except:
    print("Sense Hat library not installed.")
    pass
try:
    from gps3.agps3threaded import AGPS3mechanism
except:
    print("GPS3 library not installed.")
    pass

class Sensors(object):
    def __init__(self):
        if getattr(sys, 'frozen', False):
            configFile = Path(os.path.dirname(sys.executable) + "/config.yaml")
        else:
            configFile = Path(os.path.dirname(os.path.abspath(__file__)) + "/config.yaml")
        with open(str(configFile), 'r') as stream:
            try:
                config = yaml.load(stream)
            except yaml.YAMLError as exc:
                print(exc)
        self.currentTime = ""
        self.temperature = 0.0
        self.pressure = 0.0
        self.humidity = 0.0
        self.dataIndex = 0
        self.latitude = "n/a"
        self.longitude = "n/a"
        self.cpu = "n/a"
        self.ram = "n/a"
        #self.bat = "00:00:00"
        self.pin = config['sensors']['temp_pin']

    def initializeSensors(self):
        # Instantiate GPS data retrieval mechanism
        try:
            self.agps_thread = AGPS3mechanism()
            self.agps_thread.stream_data()
            self.agps_thread.run_thread()
        except:
            print("Failed initializing GPS")
            pass
        
        self.sense = None
        self.pressureSensor = None
        try:
            self.sense = SenseHat()
        except:
            print("Failed initializing Sense Hat")
            pass

        try:
            self.pressureSensor = BMP280.BMP280()
        except:
            print("Failed initializing Pressure Sensor")
            pass
    
    def getTime(self):
        self.currentTime = str(datetime.datetime.utcnow())

    def getSensorData(self, apikey):
        weatherdata = OrderedDict()
        threads = []
        threads.append(threading.Thread(target=self.getWeather, args = ()))
        threads.append(threading.Thread(target=self.getGpsCoords, args = ()))
        threads.append(threading.Thread(target=self.getTime, args = ()))
        for t in threads:
            t.start()

        for t in threads:
            t.join()

        weatherdata["created_at"] = self.currentTime
        weatherdata["apikey"] = apikey
        weatherdata["temperature"] = round(self.temperature, 2)
        weatherdata["humidity"] = round(self.humidity, 2)
        weatherdata["pressure"] = round(self.pressure, 2)
        weatherdata["latitude"] = self.latitude
        weatherdata["longitude"] = self.longitude
        weatherdata["cpu_usage"] = cpu_usage
        #weatherdata["bat"] = bat
        weatherdata["ram_usage"] = ram_usage
        weatherdata["data_index"] = self.dataIndex
        self.dataIndex += 1

        return weatherdata

    def getWeather(self):
        # Attempt to retrieve humidity + temperature
        try:
            humidity, temperature = Adafruit_DHT.read(Adafruit_DHT.AM2302, self.pin)
            
            if (temperature):
                self.temperature = temperature * (9.0/5.0) + 32
            if (humidity):
                self.humidity = humidity
        except:
            pass
        
        if (self.pressureSensor):
            try:
                pressure = self.pressureSensor.read_pressure() / 100
                if(pressure):
                    self.pressure = pressure
            except:
                pass

        # Attempt to retrieve from sense hat
        if (self.sense):
            try:
                self.humidity = self.sense.humidity
                self.temperature = (9.0/5.0) * self.sense.temperature + 32
                self.pressure = self.sense.pressure

                # TODO: Fix below code as it is buggy with the sense hat (can cause +-700deg temps)
                # Calibrate the temperature to account for CPU temp with the sense hat
                cpu_temp = subprocess.check_output("vcgencmd measure_temp", shell=True)
                array = cpu_temp.split("=")
                array = array[1].split("'")

                cpu_temp = float(array[0]) * (9.0/5.0) + 32.0
                cpu_temp = float("{0:.2f}".format(cpu_temp))
                self.temperature = self.temperature - ((cpu_temp - self.temperature) / 2.2)
            except:
                pass
        # self.temperature = random.uniform(70.0, 73.0)
        # self.humidity = random.uniform(50.0, 54.0)
        # self.pressure = random.uniform(1040.0, 1075.0)

    def getGpsCoords(self):
        # Try to get latitude and longitude data from our receiver
        try:
            latitude = self.agps_thread.data_stream.lat
            longitude = self.agps_thread.data_stream.lon
            if (latitude != "n/a" and longitude != "n/a"):
                self.latitude = latitude
                self.longitude = longitude
                self.saveLatestGpsCoords()
            else:
                if getattr(sys, 'frozen', False):
                    file = Path(os.path.dirname(sys.executable) + "/.latest-location.txt")
                else:
                    file = Path(os.path.dirname(os.path.abspath(__file__)) + "/.latest-location.txt")
                if file.is_file():
                    with open(str(file), 'r') as f:
                        for data in f:
                            data = data.rstrip('\n')
                            data = [col.strip() for col in data.split(',')]
                            self.latitude = data[0]
                            self.longitude = data[1]         
            # self.latitude = "42.357134"
            # self.longitude = "-83.070308"
        except:
            pass

    def saveLatestGpsCoords(self):
        if getattr(sys, 'frozen', False):
            file = Path(os.path.dirname(sys.executable) + "/.latest-location.txt")
        else:
            file = Path(os.path.dirname(os.path.abspath(__file__)) + "/.latest-location.txt")
        f = open(str(file), 'w')
        f.write(str(self.latitude) + "," + str(self.longitude))
        f.close()