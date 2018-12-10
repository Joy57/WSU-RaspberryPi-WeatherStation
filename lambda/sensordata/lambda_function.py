import sys
import logging
import rds_config
import pymysql
import json
#rds settings
from parser import parser

rds_host  = rds_config.db_host
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name


logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except Exception as e:
    print(e)

logger.info("SUCCESS: Connection to RDS mysql instance succeeded ")

def db(query):
    with conn.cursor() as cur:
        print(query)
        cur.execute(query)
        for row in cur:
            print("ROW-->",row[0])
            result = row[0]
    conn.commit()


def do_work(line):
    res = parser(line)
    print(res['date'])
    date = str(res['date'])
    api = str(res['apiKey']).strip()
    temp = str(res['temp']).strip()
    humidity = str(res['humidity']).strip()
    pressure = str(res['pressure']).strip()
    latitude = str(res['latitude']).strip()
    longitude = str(res['longitude']).strip()
    cpu = str(res['cpu']).strip()
    battery = str(res['battery']).strip()
    ram = str(res['ram']).strip()
    windDirection = str(res['windDirection']).strip()
    windSpeed = str(res['windSpeed']).strip()
    tableName = "sensor_type"
    api_length = len(res['apiKey'])
    print("api_length: ", api_length)
    if api_length < 2:
        return {
            "headers":{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
            "statusCode": 400,
            "body": json.dumps("INVALID API KEY")
        }
    query = "INSERT INTO "+tableName+" (created_at, temperature, humidity, pressure, latitude, longitude, apikey, cpu_usage, battery, ram_usage, wind_speed, wind_direction) VALUES ("+"'"+date+"','"+temp+"','"+humidity+"','"+pressure+"','"+latitude+"','"+longitude+"','"+api+"','"+cpu+"','"+battery+"','"+ram+"','"+windSpeed+"','"+windDirection+"')"
    db(query)
    
    with conn.cursor() as cur:
        cur.execute("SELECT LAST_INSERT_ID()")
        for row in cur:
            print("ROW-->",row[0])
            result = row[0]
    conn.commit
    print(str(result))
    res = str(result)
  
    delete_latest = "DELETE from latestweather where apikey='"+api+"';"
    print("Delete query-->",delete_latest)
    insert_latest = "INSERT INTO latestweather (weather_id, apikey) VALUES ("+str(result)+", '"+api+"');"
    print("Insert query-->",insert_latest)

    db(delete_latest)
    db(insert_latest)
    
    
    
    return 1


def handler(event, context):
    """
    This function fetches content from mysql RDS instance
    """
     
    req = event['body']    
    res = do_work(req)
    print(req)

    return {
        "headers":{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
        "statusCode": 200,
        "body": json.dumps(req)
        }