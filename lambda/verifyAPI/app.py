import sys
import logging
import rds_config
import pymysql
import json

#rds settings 
rds_host  = rds_config.db_host
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_connection():
    """get a connection to the dbms"""
    try:
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        logger.info("SUCCESS: Connection to RDS mysql instance succeeded")
        return conn
    except:
        logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
        # sys.exit()
        return "error connecting"

def get_result(apikey):
    """fetch content from mysql RDS instance"""
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("select COUNT(apikey) from stations where apikey='"+str(apikey)+"'")
        results = cur.fetchall()
        print("RESULTS-->",results)
        # for row in cur:
        #     print("ROW-->",row[0])
        #     result = row[0]

    conn.commit()
    return results



def handler(event, context):
    """
    main entry point for the lambda
    """
    # print("event type-->", type(event))
    # print("event==> ",event)
    req = event['body']
    # print("req", req)
    loaded_req = json.loads(req)
    apikey = loaded_req['key']
    # print("loaded==> ", apikey)


    result = get_result(apikey)
    # print("RETURNED FROM GET_RESULT:", result)
    if (result == 1):
        return {
        "headers":{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
        "statusCode": 200,
        "body": json.dumps("API Verified!")
        }
    else:
        return {
        "headers":{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
        "statusCode": 400,
        "body": json.dumps("Invalid API")
        }