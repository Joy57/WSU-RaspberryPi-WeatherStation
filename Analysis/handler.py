# import sys
import json
from parser import parser
import pi_storm

def do_analysis(line):

    temp = str(line[2])
    humidity=str(line[3])
    pressure=str(line[4])
    windSpeed=str(line[11])
    windDirection=str(line[12])
    
    res_ml = pi_storm.ml(temp,pressure,humidity,windDirection,windSpeed)
    
    # print(res_ml)
    return res_ml




def handler(data):     
 
    req = "2018, 882dba8efa2519f3003d, 86.58, 50.83, 994.97, 42.362495442, -83.071719216, 23, , 50, 260, 2"
    res = do_analysis(data)
    print(res)
    print("response from model:",res)
    return res

if __name__=="__main__":
    data="2018, 882dba8efa2519f3003d, 86.58, 50.83, 994.97, 42.362495442, -83.071719216, 23, , 50, 260, 2"
    handler(data)

