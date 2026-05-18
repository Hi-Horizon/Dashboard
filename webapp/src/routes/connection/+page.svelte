<script lang="ts">
import { onMount } from "svelte";
import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";
import { once } from '@tauri-apps/api/event';
import { setupPageDefault } from "$lib/setupPageDefault.js";
import { pageName } from "../../stores.js";
import Cell from "$lib/Components/cell.svelte";
import { MQTTconnected } from "../ConnectionStores.js";

import { invoke } from '@tauri-apps/api/core';
import { listen } from "@tauri-apps/api/event";
    
setupPageDefault();
pageName.set("Connection");

export let data;

let mqttUrl:any = data.MQTTBROKERURL;
let mqttBrokerPort:any = data.MQTTBROKERPORT;
let mqttClientId:any = data.MQTTCLIENTID;

let mqttUser: string = "admin"
let mqttPassword: string = ""
let topic = "data";
let message = "hello";
let connectId = "1"

  async function connect() {
    try {
      await mqtt.connect(connectId, "mqtts://"+ mqttUser +":"+ mqttPassword +"@"+ mqttUrl +":8883?client_id=test", { skipVerification: true })
      await mqtt.subscribe(connectId, topic, 0);    
    } catch (e) {
      console.log({e})
    }
    const unlisten = await once('plugin://mqtt', (event: any) => {
      if (event.payload.event.connect === undefined) {
        alert("connection failed, check credentials and try again")
      } else {
        alert("connected")
      }
    });
  }

  async function disconnect() {
    try {
      await mqtt.disconnect(connectId);
      $MQTTconnected = false
      alert("MQTT broker has been disconnected")
    } catch (e) {
      alert("Error while disconnecting: \n" + e)
    }
  }

  async function connectToPeakCanDevice() {
      try {
          // Set up listeners before connecting
          const unlisten = await listen<{ id: number; data: number[] }>("can-frame", (event) => {
            console.log("CAN frame:", event.payload);
          });

          const unlistenErr = await listen<string>("can-error", (event) => {
            console.error("CAN error:", event.payload);
          });
          
          const response = await invoke('connect_can');
          console.log(response);
      } catch (error) {
          console.error("Failed to connect:", error);
      }
  }

  async function disconnectToPeakCanDevice() {
      try {
          const response = await invoke('disconnect_can');
          console.log(response);
      } catch (error) {
          console.error("Failed to disconnect:", error);
      }
  }

  listen('CAN-message-received', (event : any) => {
    console.log(
      event
    );
  });

let showImage: boolean = false;
onMount(()=>{
    showImage = true;
});
</script>

<svelte:head>
	<title>Connections</title>
</svelte:head>

<div class="flex flex-col items-center justify-center space-y-5">
  <Cell>
    <form class="flex flex-col space-y-1 w-xl" onsubmit={connect}>
      <label for=mqttUser>MQTT username</label>
      <input id="mqttUser" bind:value={mqttUser} class="bg-stone-200  text-stone-900 rounded px-2" placeholder="username" name="username">
      <label for=mqttPwd class="pt-1">MQTT password</label>
      <input id="mqttPwd" bind:value={mqttPassword} type="password" class="bg-stone-200  text-stone-900 rounded px-2" placeholder="password" name="password">
      <div class="flex w-full justify-end space-x-2">
        <button type="button" onclick={disconnect} class="mt-7 px-3 text-stone-50 bg-red-400 hover:bg-red-300 rounded">Disconnect</button>
        <button type="submit" class="mt-7 px-5 text-stone-50 bg-green-600 hover:bg-green-500 rounded">Connect</button>
      </div>
    </form>
  </Cell>
  <Cell>
    <button onclick={disconnectToPeakCanDevice} class="mt-7 px-3 text-stone-50 bg-red-400 hover:bg-red-300 rounded">Disconnect to Peak-CAN device</button>
    <button onclick={connectToPeakCanDevice} class="mt-7 px-5 text-stone-50 bg-green-600 hover:bg-green-500 rounded">Connect to Peak-CAN device</button>
  </Cell>
</div>