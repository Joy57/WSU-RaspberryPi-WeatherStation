import json
import datetime
from dateutil import tz

def parser_helper(line):
    from_zone = tz.gettz('UTC')
    to_zone = tz.gettz('EST')
    utc = datetime.datetime.now()
    utc = utc.replace(tzinfo=from_zone)
    etc = utc.astimezone(to_zone)
    new_time = str(etc)
    try:
        for i in range(len(line)):
            if i == 0:
                nondec, dec = new_time.split(".")
                in_date = nondec
            elif i == 1:
                in_apiKey = line[i]
            elif i == 2:
                in_temp = line[i]
            elif i == 3:
                in_humidity = line[i]
            elif i == 4:
                in_pressure = line[i]
            elif i == 5:
                in_latitude = line[i]
            elif i == 6:
                in_longitude = line[i]
            elif i == 7:
                in_cpu = line[i]
            elif i == 8:
                in_battery = "00:00:00"
            elif i == 9:
                in_ram = line[i]
            elif i == 10:
                in_windDirection = line[i]
                print("inwindDirection: ", in_windDirection)
            elif i == 11:
                in_windSpeed = line[i]
                print("inwindSpeed: ", in_windSpeed)
    except Exception as e:
        print(e)
        
    try:
        data = {"date": str(in_date), "apiKey": in_apiKey, "temp": in_temp, "humidity": in_humidity, "pressure": in_pressure, "latitude": in_latitude, "longitude": in_longitude, "cpu": in_cpu, "battery": in_battery, "ram": in_ram,"windDirection": in_windDirection, "windSpeed":in_windSpeed}
        json_data = json.dumps(data)
    except Exception as e:
        print("Rejected incoming data")
    
    return json_data

def convertToList(string): 
    line = list(string.split(",")) 
    return line 

def parse(line):
    new_line = convertToList(line)
    data = parser_helper(new_line)
    return data

def parser(line):
    # line= "2018-09-18 17:35:02.066199, 28cbe87809185a040a5d, 86.58, 50.83, 994.97, 42.362495442, -83.071719216"
    ret = parse(line)
    resp = json.loads(ret)
    #returns a parsable json object
    return resp

if __name__=="__main__":
    parser()
