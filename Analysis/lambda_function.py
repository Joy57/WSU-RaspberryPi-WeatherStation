# import sys
import json
from parser import parser
import pi_storm

def do_work(line):
    res = parser(line)
    print(res['date'])
    date = str(res['date'])
    temp = str(res['temp']).strip()
    humidity = str(res['humidity']).strip()
    pressure = str(res['pressure']).strip()

    windDirection = str(res['windDirection']).strip()
    windSpeed = str(res['windSpeed']).strip()
    # tableName = "sensor_type"
    # api_length = len(res['apiKey'])
    
    # "'"+date+"','"+temp+"','"+humidity+"','"+pressure+"','"+latitude+"','"+longitude+"','"+api+"','"+cpu+"','"+battery+"','"+ram+"','"+windSpeed+"','"+windDirection+"')"
    res_ml = pi_storm.ml(temp,pressure,humidity,windDirection,windSpeed)
    
    # print(res_ml)
    return res_ml




def handler(event, context):
    """
    This function fetches content from mysql RDS instance
    """
     
    # req = event['body']    
    req = "2018, 882dba8efa2519f3003d, 86.58, 50.83, 994.97, 42.362495442, -83.071719216, 23, , 50, 260, 2"
    res = do_work(req)
    print(res)
    print("response from model:",res)
    return res
    # return {
    #     "headers":{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
    #     "statusCode": 200,
    #     "body": json.dumps(res)
    #     }

if __name__=="__main__":
    handler("","")

