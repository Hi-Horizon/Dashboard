<script lang="ts">
    import { pageName, showBackButton } from "../../stores";
    import { io } from "socket.io-client";
    import { writable } from "svelte/store";
    
    let currentPageName: string = "Page";

    pageName.subscribe((value) => {
        currentPageName = value;
    });

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
<div class="flex">
    <ul class="sticky top-0 flex-shrink-0 flex flex-col p-5 h-screen bg-stone-800 text-center space-y-5">
        <li class=""><a href="/user/dashboard"><img src="/icons/dashboard.svg" alt="Dashboard" class="hover:bg-stone-700 rounded"></a></li>
        <li class="flex-1"><a href="/user/graphViewer"><img src="/icons/graph.svg" alt="Graphs" class="hover:bg-stone-700 rounded"></a></li>
        <li class="justify-self-end"><a href="/user/settings"><img src="/icons/settings.svg" alt="Settings" class="hover:bg-stone-700 rounded"></a></li>
        <li class="justify-self-end"><form method="POST" action="?/logout"><button formaction="..?/logout"><img src="/icons/logout.svg" alt="Logout" class="hover:bg-stone-700 rounded"></button></form></li>
    </ul>
    <div class="flex-grow p-5 flex flex-col">
        <div class="flex pb-5 justify-center">
            {#if $showBackButton === true}
            <a href="./" on:click={()=>showBackButton.set(false)} class="hover:bg-stone-600 rounded text-center p-3 justify-self-start"><img src="/icons/arrowBack.svg" alt="Go Back"></a>
            {/if}
            <h1 class="text-center font-bold text-2xl self-center justify-self-center flex-grow">{currentPageName}</h1>
        </div>
        <slot></slot>
    </div>
</div>