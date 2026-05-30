<script lang="ts">
import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";
import { once } from '@tauri-apps/api/event';
import { setupPageDefault } from "$lib/setupPageDefault.js";
import { pageName, selectedConnection } from "../../stores.js";
import Cell from "$lib/Components/cell.svelte";
import { MQTTconnected } from "../ConnectionStores.js";

import { invoke } from '@tauri-apps/api/core';
import { listen } from "@tauri-apps/api/event";
import type { DataStreamCANbus } from "../../lib/interfaces/DataStreamCANbus.js";
    import { db } from "../../lib/IOconnections/DBO/databaseObject.js";
import { convertMQTTToRawCANbusMessages } from "../../lib/IOconnections/MQTT/MQTTparser.js";
    
setupPageDefault();
pageName.set("Connection");

export let data;

async function setSelectedConnection(newConnection: DataStreamCANbus | null) {
  $selectedConnection?.unlisten?.();
  await $selectedConnection?.disconnect()

  selectedConnection.set(newConnection)
  $MQTTconnected = await newConnection?.connect() || false
  // TODO: in the future, new incoming data should always be updated, not only in the dashboard,
  // this code should be expanded by:
  // - parsing CANbus messages before insertion into the database, possibly with a canschema store object
  // - creating an event that is emitted after insertion, to which the dashboard will listen and fetch data from the database
  // - alternatively, put the livedata in a global store, and and update directly
  // const unlisten = await newConnection?.listen((messages:any) => {
  //   const curDate = new Date()
  //   Object.keys(messages)
  //     .map(async (key: string) => {
  //       await db.execute('INSERT INTO Data Values ( ? , ? , ? )', [curDate.getTime(), key, messages[key]]);
  //     })
  // }) || null

  // if ($selectedConnection !== null) {
  //   $selectedConnection.unlisten = unlisten
  // }
}

let mqttUrl:any = data.MQTTBROKERURL;
let mqttBrokerPort:any = data.MQTTBROKERPORT;
let mqttClientId:any = data.MQTTCLIENTID;

let mqttUser: string = "admin"
let mqttPassword: string = ""
let topic = "data";
let connectId = "1"

const MQTTDataStream: DataStreamCANbus = {
  async connect() {
    //connect to broker and subsricbe to topic
    try {
      await mqtt.connect(connectId, "mqtts://"+ mqttUser +":"+ mqttPassword +"@"+ mqttUrl +":8883?client_id=test", { skipVerification: true })
      await mqtt.subscribe(connectId, topic, 0);    
    } catch (e) {
      alert(e)
      selectedConnection.set(null)
      return false
    }

    // listen to connected event from backend
    const unlisten = await once('plugin://mqtt', (event: any) => {
      if (event.payload.event.connect === undefined) {
        alert("connection failed, check credentials and try again")
        selectedConnection.set(null)
        return false
      } else {
        alert("connected")
        return true
      }
    });
    return false
  },

  async disconnect() {
    try {
      await mqtt.disconnect(connectId);
      alert("MQTT broker has been disconnected")
      return true
    } catch (e) {
      alert("Error while disconnecting: \n" + e)
      selectedConnection.set(null)
      return false
    }
  },

  async listen(handler: (payload: any) => unknown) {
    return await mqtt.listen(async (x: any) => {
        try {
            const payload = x.payload.event.message.payload
            const CANbusMessages = convertMQTTToRawCANbusMessages(payload)
            handler(CANbusMessages)
        } catch (error) {
            console.log(x)
        }
    })
  },
  unlisten:null
}

// Set up listeners before connecting
let unlistenErr: (() => void) | null = null;

const PeakCANDataStream: DataStreamCANbus = {
  async connect() {
      try {
        unlistenErr = await listen<string>("can-error", (event) => {
          console.error("CAN error:", event.payload);
        });

        const response = await invoke('connect_can');
        console.log(response);
        return true
      } catch (error) {
        alert(error);
        selectedConnection.set(null)
        return false
      }
  },

  async disconnect() {
      try {
        const response = await invoke('disconnect_can');
        console.log(response);
        return true
      } catch (error) {
        alert(error);
        selectedConnection.set(null)
        return false
      }  finally {
        unlistenErr?.();
        unlistenErr = null;
      }
  },

  async listen(handler: (messages: any) => unknown) {
    return await listen('can-frame', (event : any) => {
        try {
            const frame = event.payload
            // const dataObj = parseCANmessage(frame.id, frame.data, canSchema)
            handler(frame)
        } catch (error) {
            console.log(error)
        }
    })
  },
  unlisten:null
}

</script>

<svelte:head>
	<title>Connections</title>
</svelte:head>

<div class="flex flex-col items-center justify-center space-y-5">
  <Cell>
    <p class="text-left font-bold text-lg">MQTT</p>
    <form class="flex flex-col space-y-1 w-xl" onsubmit={() => setSelectedConnection(MQTTDataStream)}>
      <label for=mqttUser>username</label>
      <input id="mqttUser" bind:value={mqttUser} class="bg-stone-200  text-stone-900 rounded px-2" placeholder="username" name="username">
      <label for=mqttPwd class="pt-1">password</label>
      <input id="mqttPwd" bind:value={mqttPassword} type="password" class="bg-stone-200  text-stone-900 rounded px-2" placeholder="password" name="password">
      <div class="flex w-full justify-end space-x-2">
        <button type="button" onclick={() => setSelectedConnection(null)} class="mt-7 px-3 text-stone-50 bg-red-400 hover:bg-red-300 rounded">Disconnect</button>
        <button type="submit" class="mt-7 px-5 text-stone-50 bg-green-600 hover:bg-green-500 rounded">Connect</button>
      </div>
    </form>
  </Cell>
  <Cell>
    <p class="text-left font-bold text-lg">Peak-CAN</p>
    <button onclick={() => setSelectedConnection(null)} class="mt-7 px-3 text-stone-50 bg-red-400 hover:bg-red-300 rounded">Disconnect to device</button>
    <button onclick={() => setSelectedConnection(PeakCANDataStream)} class="mt-7 px-5 text-stone-50 bg-green-600 hover:bg-green-500 rounded">Connect to device</button>
  </Cell>
</div>