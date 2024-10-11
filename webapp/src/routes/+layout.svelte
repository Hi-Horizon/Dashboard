<script lang="ts">
    import { setupPageDefault } from "$lib/setupPageDefault";
    import { io } from "socket.io-client";
    import "../app.css";
    import { writable } from "svelte/store";
    
    const socket = io();
    const askMQTT = writable(false)
    let mqttusername = ""
    let mqttpassword = ""
   
    socket.on("request_mqtt_credentials", async (message) => {
        askMQTT.set(true)
    })

    function submitMqttCredentials() {
        socket.emit("mqtt_credentials",{ username:mqttusername, password:mqttpassword })
        askMQTT.set(false)
    }
</script>

{#if $askMQTT }
<div>
    <div class="absolute h-full w-full bg-opacity-50 bg-stone-700 left-0 top-0 flex justify-center align-middle">
        <div class="relative bg-stone-800 flex flex-col p-10 space-y-2 h-fit align-middle self-center rounded-md">
            <div class="text-2xl">Please enter MQTT user credentials</div>
            <input placeholder="name" name="mqttusername" bind:value={ mqttusername } class="rounded-sm bg-stone-700 p-2">
            <input type="password" name="mqttpassword" placeholder="password" bind:value={ mqttpassword } class="rounded-sm bg-stone-700 p-2">
            <input type="submit" on:click={ submitMqttCredentials } class="rounded-sm bg-stone-700 hover:bg-stone-600 p-2">
        </div>
    </div>
</div>
{/if}
<slot>
</slot>