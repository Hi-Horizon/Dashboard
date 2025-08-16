import pathlib
import sqlite3
import time
import paho.mqtt.client as paho
from getpass import getpass
from paho import mqtt
import json
import math
import socketio
import os
import sys

localhost_connected = False
mqtt_credentials_received = False
mqtt_username = ""
mqtt_password = ""


sio = socketio.Client()

@sio.event
def connect():
    print('connection established')

@sio.event
def mqtt_credentials(data):
    global mqtt_credentials_received
    mqtt_credentials_received= True
    global mqtt_username
    mqtt_username = data["username"]
    global mqtt_password
    mqtt_password = data["password"]

@sio.event
def disconnect():
    print('disconnected from server')

print("waiting for localhost to be launched..")
while not localhost_connected:
    try:
        sio.connect('http://localhost:5173')
        localhost_connected = True
    except:
        print(".")

def requestMQTTcredentials():
    global mqtt_credentials_received
    mqtt_credentials_received = False
    print("waiting for mqtt_credentials", end="")
    while not mqtt_credentials_received:
        print('.', end='')
        sio.emit("request_mqtt_credentials")
        time.sleep(1)

requestMQTTcredentials()

# root = str(pathlib.Path(__file__).parent.resolve())
if getattr(sys, 'frozen', False):
    root = os.path.dirname(sys.executable) + "\..\.."
elif __file__:
    root = os.path.dirname(__file__)

try:
    db = sqlite3.connect('file:'+root+'\..\db\HiHorizonTelemetry.db?mode=rw', uri=True)

    cur = db.cursor()

    def degreesMinutesToDecimalDegrees(rawValue: float):
        degrees = math.floor(rawValue / 100)
        minutes = rawValue - (degrees * 100)
        minutesToDegrees = minutes / 60.0
        return degrees + minutesToDegrees

    def calculateDistance(lat1, lng1, lat2, lng2):
        earthRadius = 6371e3; # metres
        latitude1_in_radians = lat1 * math.pi/180 # φ, λ in radians
        latitude2_in_radians = lat2 * math.pi/180
        delta_phi = (lat2-lat1) * math.pi/180
        delta_longitude = (lng2-lng1) * math.pi/180

        a = math.sin(delta_phi/2) * math.sin(delta_phi/2) + math.cos(latitude1_in_radians) * math.cos(latitude2_in_radians) * math.sin(delta_longitude/2) * math.sin(delta_longitude/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

        return abs(earthRadius * c) # in metres
    
    def calculateDistanceSimple(lat1, lng1, lat2, lng2):
        return math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2)

    def insertMapToDatabase(dataFrame):
        beginTime = time.time()
        #get all the current dataTypes from the database
        res = cur.execute("SELECT id, tag FROM DataDescription")
        typeRows = res.fetchall()
        
        valuesToInsert = []
        columnsToInsert = []

        #checks for every type in the database if it got a variable in the message
        for type in typeRows:
            try:
                value = dataFrame[type[1]]
                if (type[1] == "lat" or type[1] == "lng"):
                    value = degreesMinutesToDecimalDegrees(value)

                valuesToInsert.append(value)
                columnsToInsert.append(type[0])
            except:
                print("Warning: " + type[1] + " is not inside the message")
        
        #add UnixTime (PK) to the columns to update
        columnsToInsert.append("UnixTime")
        valuesToInsert.append(int(time.time()) + 7200) #adjusting for timezone

        #add distance travelled from the lat lng coordinates
        try:
            dataFrame["lat"] = degreesMinutesToDecimalDegrees(dataFrame["lat"])
            dataFrame["lng"] = degreesMinutesToDecimalDegrees(dataFrame["lng"])
            #get previous coordinates
            res = cur.execute("SELECT Data.'11', Data.'12', Data.'13' FROM Data WHERE UnixTime = (SELECT max(UnixTime) FROM Data)")
            coordinates = res.fetchall()[0]
            prevLat = coordinates[0]
            prevLng = coordinates[1]
            
            valuesToInsert.append(coordinates[2] + calculateDistance(prevLat, prevLng, dataFrame["lat"], dataFrame["lng"]))
            columnsToInsert.append(13)
        except Exception as error:
            print(error)

        print(columnsToInsert)  
        print(valuesToInsert)
        
        #makes the specified length placeholders for the values, and a string containing the column_names
        columns = ""
        placeholders = ""
        for i in range(len(columnsToInsert)):
            columns = columns + '"' + str(columnsToInsert[i]) + '"' + ","
            placeholders = placeholders + "?,"

        #remove last comma
        columns = columns[:len(columns)-1]
        placeholders = placeholders[:len(placeholders)-1]
        
        #insert data into the database
        try:
            cur.execute("INSERT INTO Data ("+ columns +") VALUES ("+ placeholders +")", valuesToInsert)
            db.commit()
        except Exception as error:
            print(error)
        
        print("insertion took " + str(time.time() - beginTime) + " seconds")
        #ping webapp for new data
        sio.emit("newData", {})


    def on_connect(client, userdata, flags, rc, properties=None):
        print("CONNACK received with code %s." % rc)
        if (rc == 0):
            client.subscribe("data")
        else:

            requestMQTTcredentials()
            client.username_pw_set(mqtt_username, mqtt_password)

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
            except Exception as error:
                print("huh?")
                print(error)
            


    # using MQTT version 5 here, for 3.1.1: MQTTv311, 3.1: MQTTv31
    # userdata is user defined data of any type, updated by user_data_set()
    # client_id is the given name of the client
    client = paho.Client(userdata=None, protocol=paho.MQTTv5)
    client.on_connect = on_connect

    # enable TLS for secure connection
    client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)
    # set username and password
    client.username_pw_set(mqtt_username, mqtt_password)
    # connect to HiveMQ Cloud on port 8883 (default for MQTT)
    client.connect("7f15879e36cf4f3781ca3df1f338b397.s1.eu.hivemq.cloud", 8883)

    # setting callbacks, use separate functions like above for better visibility
    client.on_subscribe = on_subscribe
    client.on_message = on_message
    client.on_publish = on_publish

    # subscribe to all topics of encyclopedia by using the wildcard "#"

    client.loop_forever()
except Exception as error:
    print(error)
    input()