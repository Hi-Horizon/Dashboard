<script lang="ts">
import { invoke } from '@tauri-apps/api/core';
import { setupPageDefault } from "$lib/setupPageDefault.js";
import { pageName } from "../../stores.js";
import Cell from "$lib/Components/cell.svelte";

setupPageDefault();
pageName.set("Connection");

let mqttUser: string = "admin"
let mqttPassword: string = ""

async function connect_mqtt() {
  await invoke('connect_mqtt', { creds: { username: mqttUser, password: mqttPassword } });
}

  async function disconnect_mqtt() {
  await invoke('disconnect_mqtt');
}

</script>

<svelte:head>
	<title>Connections</title>
</svelte:head>

<div class="flex flex-col items-center justify-center space-y-5">
  <Cell>
    <p class="text-left font-bold text-lg">MQTT</p>
    <form class="flex flex-col space-y-1 w-xl" onsubmit={connect_mqtt}>
      <label for=mqttUser>username</label>
      <input id="mqttUser" bind:value={mqttUser} class="bg-stone-200  text-stone-900 rounded px-2" placeholder="username" name="username">
      <label for=mqttPwd class="pt-1">password</label>
      <input id="mqttPwd" bind:value={mqttPassword} type="password" class="bg-stone-200  text-stone-900 rounded px-2" placeholder="password" name="password">
      <div class="flex w-full justify-end space-x-2">
        <button type="button" onclick={disconnect_mqtt} class="mt-7 px-3 text-stone-50 bg-red-400 hover:bg-red-300 rounded">Disconnect</button>
        <button type="submit" class="mt-7 px-5 text-stone-50 bg-green-600 hover:bg-green-500 rounded">Connect</button>
      </div>
    </form>
  </Cell>
  <Cell>
    <p class="text-left font-bold text-lg">Peak-CAN</p>
    <button onclick={() => {}} class="mt-7 px-3 text-stone-50 bg-red-400 hover:bg-red-300 rounded">Disconnect to device</button>
    <button onclick={() => {}} class="mt-7 px-5 text-stone-50 bg-green-600 hover:bg-green-500 rounded">Connect to device</button>
  </Cell>
</div>