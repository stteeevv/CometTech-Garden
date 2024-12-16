# Description: This script reads the serial data from the arduino and uploads it to the dynamoDB table
import serial
import boto3
import uuid
import datetime
from decimal import Decimal
import dotenv
import os


dotenv.load_dotenv()
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
tablename = os.getenv('TABLE_NAME')
table = dynamodb.Table(tablename)
try:
    try:
        ser = serial.Serial('/dev/ttyACM0', 9600, 8, 'N', 1, timeout = 1)
    except:
        ser = serial.Serial('/dev/ttyACM1', 9600, 8, 'N', 1, timeout = 1)
except:
    print("Serial port not connected")
    exit()
print("Serial port connected")

while True:
    try:
        output = ser.readline().decode('utf-8').strip()
        if output != "":
            humidity, temp, voltage = output.split()
            temp, humidity, voltage = Decimal(temp), Decimal(humidity), Decimal(voltage)
            if humidity > 1000:
                continue
            # rescale humidity to be a percentage value between 185 and 475
            humidity = (humidity - 185) / (475 - 185) * 100
            print("Temperature: ", temp, "Humidity: ", humidity, "Voltage: ", voltage, "Timestamp: ", datetime.datetime.now())
            table.put_item(Item={
                'temperature': temp,
                'humidity': humidity,
                'uuid': str(uuid.uuid4()),
                'timestamp': Decimal(datetime.datetime.now().timestamp()),
                'plot': 1,
                'voltage': voltage
        })
    except:
        continue
