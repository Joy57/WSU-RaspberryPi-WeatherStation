import os 
import time 
from twilio.rest import Client


def sendAlert(message):

    client = Client("AC103bb915a505ca4396131fd13083d65b","c1a2cee547aab1fb8340b838b5a3c2ce")
    client.messages.create(to="+13137595683",from_="+15862572867",body=message) 
                
