import os
import csv
from datetime import datetime
from twilio.rest import Client

#Define indexes and variables from weather station
date = ""
apiKey = ""
temp = ""
humidity = ""
pressure = ""
latitude = ""
longitude = ""
cpu_usage = 0
cpu_usage_str = ""
trash = ""
ram_usage = 0
cpu_usage_str = ""
numbersToMessage=[] #List of numbers

# Twilio SMS Alert
alertNumber = "+15862650844"
client = Client("ACb3a83adf61207d82409101e116b7dd03","9408eaea678ceac0b1033e4214c1e853")

#Flag indexes
alert_Flag_Index_CPU_30_70 = 21
alert_Flag_Index_CPU_70 = 23
alert_Flag_Index_RAM_30_70 = 25
alert_Flag_Index_RAM_70 = 27

# name: stormAlert
# description: Take in storm prediction from analysis and send an alert to the user about the prediction
def stormAlert(prediction):
    sendMessage = True
    stormPrediction = ""

    if prediction == 0:
        stormPrediction = "There is a chance of a THUNDERSTORM"
    elif prediction == 1:
        stormPrediction = "No incoming inclement weather"
        sendMessage = False
    elif prediction == 2:
        stormPrediction = "There is a chance of SNOW"
    elif prediction == 3:
        stormPrediction = "There is a chance of RAIN"
    else:
        sendMessage = False

    if sendMessage == True:
        client.messages.create(
            to = alertNumber,
            from_= "+13132469974",
            body = stormPrediction
        )



# name: replaceIndex
# description: replaces the index value of a string, used for changing index value for each flag
def replaceIndex(text,index=0,replacement=''):
    return '%s%s%s'%(text[:index],replacement,text[index+1:])

# name: parse
# description: parses data into seperate variables to be used for comparing
def parse(dataP):
    dataSplit = dataP.split(',')
    
    global date
    date = dataSplit[0]
    global apiKey
    apiKey = dataSplit[1].strip()
    global temp
    temp = dataSplit[2]
    global humidity
    humidity = dataSplit[3]
    global pressure 
    pressure = dataSplit[4]
    global latitude
    latitude = dataSplit[5]
    global longitude
    longitude = dataSplit[6]
    global cpu_usage
    global cpu_usage_str
    cpu_usage_str = dataSplit[7]
    cpu_usage = float(cpu_usage_str)
    # empty string
    trash = dataSplit[8]
    global ram_usage
    global ram_usage_str
    ram_usage_str = dataSplit[9].strip()
    ram_usage = float(ram_usage_str)

# name: checkFlags
# description: check whether a flag is set, if a flag is set then send a SMS alert
def checkFlags(alertFlags, index):
    warningMessage = ""
    
    sendMessage = False
    
    if cpu_usage >= 30 and cpu_usage < 70:
        if alertFlags[index][alert_Flag_Index_CPU_30_70] == '0':
            alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_CPU_30_70, '1')
            warningMessage = warningMessage + "\nWarning: CPU Usage is above 30% !"
            sendMessage = True
    
    if cpu_usage >= 70:
        if alertFlags[index][alert_Flag_Index_CPU_70] == '0':
            alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_CPU_30_70, '0')
            alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_CPU_70, '1')
            warningMessage = warningMessage + "\nWarning: CPU Usage is above 70% !"
            sendMessage = True
    
    if cpu_usage < 30:
        alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_CPU_30_70, '0')
        alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_CPU_70, '0')
        
    if ram_usage >= 30 and ram_usage < 70:
        if alertFlags[index][alert_Flag_Index_RAM_30_70] == '0':
            alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_RAM_30_70, '1')
            warningMessage = warningMessage + "\nWarning: RAM Usage is above 30% !"
            sendMessage = True
    
    if ram_usage >= 70:
        if alertFlags[index][alert_Flag_Index_RAM_70] == '0':
            alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_RAM_30_70, '0')
            alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_RAM_70, '1')
            warningMessage = warningMessage + "\nWarning: RAM Usage is above 70% !"
            sendMessage = True
    
    if ram_usage < 30:
        alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_RAM_30_70, '0')
        alertFlags[index] = replaceIndex(alertFlags[index], alert_Flag_Index_RAM_70, '0')
        
    if sendMessage == True:
        sendSMS(warningMessage)

# name: checkApiKey
# description: check whether the apiKey is in the text file, if not then add it
def checkApiKey(alertFlags, apiKey):
    found = 0
    index = 0
    for x in alertFlags:
        if( x.find(apiKey) != -1):
            found = 1
            checkFlags(alertFlags, index)
            break
        index = index + 1
    if found == 0:
        alertFlags.append(apiKey + " 0 0 0 0")
        checkFlags(alertFlags, index)

# name: raedFile
# description: read input file, alertFlags.txt, and store the numbers and flags for each station
def readFile(alertFlags, numbers):
    alertFlags[:] = []
    
    filePath = "/home/pi/WSU-RaspberryPi-WeatherStation-Dev/final_prototype/project/Client/alertFlags.txt"
    with open(filePath, "r") as f:
        x = 0
        for line in f:
            if line != "\n":
                if x == 0:
                    numbers = line
                    numbers.strip()
                    x = 1
            
                tempLine = line
                tempLine.strip()
                alertFlags.append(tempLine)
        
        NUMBERS = numbers.split('+')
        for y in NUMBERS:
            numbersToMessage.append(y)

# name: writeToFile
# description: write everything back into the text file including the changes made
def writeToFile(alertFlags, numbers):
    filePath = "/home/pi/WSU-RaspberryPi-WeatherStation-Dev/final_prototype/project/Client/alertFlags.txt"
    
    with open(filePath, 'w') as f:
        f.write("%s" % numbers)
        for line in alertFlags:
            f.write("%s" % line)
            f.write('\n')
    

# name: sendSMS
# description: send SMS to numbers listed in text file
def sendSMS(warningMessage):
        
    message = "-\nThe current status at " + apiKey + " station:\n\n" + "Temperature: " + temp + " F\n" + "Humidity: " + humidity + " %\n" + "Pressure: " + pressure + " hPa\n" "CPU Usage: " + cpu_usage_str + " %\n" + "RAM Usage: " + ram_usage_str + " %"

    print(numbersToMessage)

    for number in numbersToMessage:
        if number != '':
            client.messages.create(
                to= "+" + number,
                from_= "+13132469974",
                body=message + warningMessage
            )

def alertSMS(dataP):
    
    alertFlags=[] #List to hold flags
    numbers = ""
    
    parse(dataP)
    
    readFile(alertFlags, numbers)
    
    checkApiKey(alertFlags, apiKey)
    
    writeToFile(alertFlags, numbers)
