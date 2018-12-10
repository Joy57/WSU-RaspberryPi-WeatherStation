import pymysql 
import handler
import sms_alert

conn = pymysql.connect(host = "wsu-weather-station.cxzjmoez6mye.us-east-1.rds.amazonaws.com", user ="wsu",port =3306, passwd="wsucapstone2018", db="weatherstation")
cursor = conn.cursor() 

sql = "select * from sensor_type ;"
cursor.execute(sql)

print(cursor.rowcount)
id = cursor.rowcount

latestEntry = "select * from sensor_type where weather_id = " + str(128)
cursor.execute(latestEntry)
line = cursor.fetchone()
res = handler.handler(line)

# 0 : thunderstorm
# 1 : sky is clear
# 2 : snow
# 3 : rain
if res == 0:
    message = "Thunderstorm"
    sms_alert.sendAlert(message)    
elif res == 1:
    message = "Sky is clear"
    sms_alert.sendAlert(message)
elif res == 2:
    message = "Snow"
    sms_alert.sendAlert(message)    
elif res == 3:
    message = "Rain"
    sms_alert.sendAlert(message)
