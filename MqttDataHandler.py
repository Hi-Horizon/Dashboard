import pathlib
import sqlite3
import time
import paho.mqtt.client as paho
from getpass import getpass
from paho import mqtt
import json
import math

root = str(pathlib.Path(__file__).parent.resolve())
db = sqlite3.connect('file:'+root+'\HiHorizonTelemetry.db?mode=rw', uri=True)

cur = db.cursor()

def degreesMinutesToDecimalDegrees(rawValue: float):
    degrees = math.floor(rawValue / 100)
    minutes = rawValue - (degrees * 100)
    minutesToDegrees = minutes / 60.0
    return degrees + minutesToDegrees

def calculateDistance(lat1, lng1, lng2, lat2):
    earthRadius = 6371e3; # metres
    latitude1_in_radians = lat1 * math.PI/180 # φ, λ in radians
    latitude2_in_radians = lat2 * math.PI/180
    delta_phi = (lat2-lat1) * math.PI/180
    delta_longitude = (lng2-lng1) * math.PI/180

    a = math.sin(delta_phi/2) * math.sin(delta_phi/2) + math.cos(latitude1_in_radians) * math.cos(latitude2_in_radians) * math.sin(delta_longitude/2) * math.sin(delta_longitude/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return earthRadius * c # in metres

def brokerCredentialsInput():
    username = str(input("MQTT user: "))
    password = str(getpass("MQTT pwrd:"))
    return username,password

def insertMapToDatabase(dataFrame):
    beginTime = time.time()
    #get all the current dataTypes from the database
    res = cur.execute("SELECT name, abbreviation FROM ReadStatisticTypes")
    typeRows = res.fetchall()
    
    valuesToInsert = []
    columnsToInsert = []

    dataFrame["lat"] = degreesMinutesToDecimalDegrees(dataFrame["lat"])
    dataFrame["lng"] = degreesMinutesToDecimalDegrees(dataFrame["lng"])

    #checks for every type in the database if it got a variable in the message
    for type in typeRows:
        try:
            value = dataFrame[type[1]]
            valuesToInsert.append(value)
            columnsToInsert.append(type[1])
        except:
            print("error: " + type[1] + " is not inside the message")
    
    #add UnixTime (PK) to the columns to update
    columnsToInsert.append("UnixTime")
    valuesToInsert.append(int(time.time()) + 7200) #adjusting for timezone

    print(columnsToInsert)
    print(valuesToInsert)

    #add distance travelled from the lat lng coordinates
    try:
        #get previous coordinates
        res = cur.execute("SELECT lat, lng, d FROM Data WHERE UnixTime = (SELECT max(UnixTime) FROM Data)")
        coordinates = res.fetchall()[0]
        prevLat = degreesMinutesToDecimalDegrees(coordinates[0])
        prevLng = degreesMinutesToDecimalDegrees(coordinates[1])
        
        columnsToInsert.append("d")
        valuesToInsert.append(coordinates[2] + calculateDistance(prevLat, prevLng, dataFrame["lat"], dataFrame["lng"]))
    except Exception as error:
        print(error)
    
    #makes the specified length placeholders for the values, and a string containing the column_names
    columns = ""
    placeholders = ""
    for i in range(len(columnsToInsert)):
        columns = columns + columnsToInsert[i] + ","
        placeholders = placeholders + "?,"

    #remove last comma
    columns = columns[:len(columns)-1]
    placeholders = placeholders[:len(placeholders)-1]
    
    #insert data into the database
    try:
        cur.execute("INSERT INTO Data ("+ columns +") VALUES("+ placeholders +")", valuesToInsert)
        db.commit()
    except Exception as error:
        print(error)
    
    print("insertion took " + str(time.time() - beginTime) + " seconds")


def on_connect(client, userdata, flags, rc, properties=None):
    print("CONNACK received with code %s." % rc)
    if (rc == 0):
        client.subscribe("data")
    else: 
        username, password = brokerCredentialsInput()
        client.username_pw_set(username, password)

# with this callback you can see if your publish was successful
def on_publish(client, userdata, mid, properties=None):
    print("mid: " + str(mid))

# print which topic was subscribed to
def on_subscribe(client, userdata, mid, granted_qos, properties=None):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

# print message, useful for checking if it was successful
def on_message(client, userdata, msg):
    if(msg.topic == "data"):
        try:
            dataframe = json.loads(str(msg.payload.decode("UTF-8")))
            insertMapToDatabase(dataframe)
        except:
            print("could not convert json string to dataframe, possibly a wrong format is used")
        


# using MQTT version 5 here, for 3.1.1: MQTTv311, 3.1: MQTTv31
# userdata is user defined data of any type, updated by user_data_set()
# client_id is the given name of the client
client = paho.Client(userdata=None, protocol=paho.MQTTv5)
client.on_connect = on_connect

# enable TLS for secure connection
client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)
# set username and password
username, password = brokerCredentialsInput()
client.username_pw_set(username, password)
# connect to HiveMQ Cloud on port 8883 (default for MQTT)
client.connect("7f15879e36cf4f3781ca3df1f338b397.s1.eu.hivemq.cloud", 8883)

# setting callbacks, use separate functions like above for better visibility
client.on_subscribe = on_subscribe
client.on_message = on_message
client.on_publish = on_publish

# subscribe to all topics of encyclopedia by using the wildcard "#"

client.loop_forever()