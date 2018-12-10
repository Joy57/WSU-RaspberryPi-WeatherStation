import requests 
import json


def readFile(old):
    with open (old, "r+") as r: 
        data = r.readline()
        print(data)
        return data
    
def appending(dataP): 
    apiKey = "0f71a644a301c17097ce4c05cfce900e"
    url = "http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID="+apiKey+"&units=metrics&q=detroit"

    res = requests.post(url = url) 
    dataJSON = res.text
    loaded = json.loads(dataJSON)
    #print(loaded["list"][0]["wind"]["speed"])
    windSpeed = str(loaded["list"][0]["wind"]["speed"])
    windDeg = str(loaded["list"][0]["wind"]["deg"])
        
    #data = readFile(old)
    line = dataP.strip('\n')
    line2 = line + ", " + windDeg + ", " + windSpeed
    #print(line2)
    return line2

def appendingAnalysis(dataP):
    apiKey = "0f71a644a301c17097ce4c05cfce900e"
    url = "http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID="+apiKey+"&units=metrics&q=detroit"

    res = requests.post(url = url) 
    dataJSON = res.text
    loaded = json.loads(dataJSON)
    #print(loaded["list"][0]["wind"]["speed"])
    windSpeed = str(loaded["list"][0]["wind"]["speed"])
    windDeg = str(loaded["list"][0]["wind"]["deg"])
        
    #data = readFile(old)
    line = dataP.strip('\n')
    line2 = line + ", " + windDeg + ", " + windSpeed + ", 1"
    #print(line2)
    return line2
        


