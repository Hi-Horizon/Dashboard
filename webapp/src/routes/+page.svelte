<script lang="ts">
  import { onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";
  import { listen } from '@tauri-apps/api/event';
  import { once } from '@tauri-apps/api/event';
    import { redirect } from "@sveltejs/kit";
    import { goto } from "$app/navigation";

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
    const unlisten = await once('plugin://mqtt', (event: any) => {
      if (event.payload.event.connect === undefined) {
        alert("connection failed, check credentials and try again")
      } else {
        goto("./connected/dashboard")
      }
    }); 
    try {
      await mqtt.connect(connectId, "mqtts://"+ mqttUser +":"+ mqttPassword +"@"+ mqttUrl +":8883?client_id=test", { skipVerification: true })
      await mqtt.subscribe(connectId, topic, 0);    
    } catch (e) {
      console.log({ e })
    }
    
  }

  async function disconnect() {
    try {
      await mqtt.disconnect(connectId);
    } catch (e) {
      
    }
  }

  async function publish() {
    try {
      await mqtt.publish(connectId, topic, 0, false, message);
    } catch (e) {
      
    }
  }

  async function subscribe() {
    try {
      await mqtt.subscribe(connectId, topic, 0);
    } catch (e) {
      
    }
  }

  async function unsubscribe() {
    try {
      await mqtt.unsubscribe(connectId, topic);
    } catch (e) {
      
    }
  }

let showImage: boolean = false;
onMount(()=>{
    showImage = true;
});
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="flex flex-col items-center justify-center h-screen">
    {#if showImage === true}
        <img src="/Logo.png" alt="Logo" class="h-52 z-0" in:fly={{duration: 1000, easing: cubicOut, x:0, y:'100%'}}>
    {:else}
        <div class="h-52"></div>
    {/if}
    <div class="flex flex-col bg-stone-900 z-10 pb-10 mt-3">
        <h1 class="font-bold text-2xl pb-5">Hi-Horizon Racing Team Telemetry Dashboard</h1>
        <form class="flex flex-col space-y-3 w-1/2 self-center" on:submit={connect}>
            <input bind:value={mqttUser} class="bg-white text-stone-900 rounded text-center" placeholder="username" name="username">
            <input bind:value={mqttPassword} type="password" class="bg-white text-stone-900 rounded text-center" placeholder="password" name="password">
            <button type="submit" class="bg-red-600 hover:bg-red-500 rounded">Login</button>
        </form>
    </div>
</div>