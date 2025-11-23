<script lang="ts">
    import { pageName, showBackButton } from "../../stores";
    import { writable } from "svelte/store";
    import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";
    import { goto } from "$app/navigation";

    let currentPageName: string = "Page";

    pageName.subscribe((value) => {
        currentPageName = value;
    });

    const askMQTT = writable(false)
    let mqttusername = ""
    let mqttpassword = ""


    async function disconnect() {
        try {
            await mqtt.disconnect("1");
            goto("../")
        } catch (e) {
            alert(e);
            goto("../")
        }
    }


</script>

{#if $askMQTT }
<div>
    <div class="absolute h-full w-full bg-opacity-50 bg-stone-200 dark:bg-stone-800 left-0 top-0 flex justify-center align-middle">
        <div class="relative bg-stone-800 flex flex-col p-10 space-y-2 h-fit align-middle self-center rounded-md">
            <div class="text-2xl">Please enter MQTT user credentials</div>
            <input placeholder="name" name="mqttusername" bind:value={ mqttusername } class="rounded-sm bg-stone-700 p-2">
            <input type="password" name="mqttpassword" placeholder="password" bind:value={ mqttpassword } class="rounded-sm bg-stone-700 p-2">
            <input type="submit" class="rounded-sm bg-stone-700 hover:bg-stone-600 p-2">
        </div>
    </div>
</div>
{/if}
<div class="flex">
    <ul class="sticky top-0 shrink-0 flex flex-col p-5 h-screen bg-stone-200 dark:bg-stone-800 text-center space-y-5">
        <li class=""><a href="./dashboard"><img src="/icons/dashboard.svg" alt="Dashboard" class="hover:bg-stone-700 not-dark:invert rounded"></a></li>
        <li class="flex-1"><a href="./analyzation"><img src="/icons/graph.svg" alt="analyzation" class="hover:bg-stone-700 not-dark:invert rounded"></a></li>
        <li class="justify-self-end"><a href="./settings"><img src="/icons/settings.svg" alt="Settings" class="hover:bg-stone-700 not-dark:invert rounded"></a></li>
        <li class="justify-self-end"><button on:click={disconnect}><img src="/icons/logout.svg" alt="Logout" class="hover:bg-stone-700 not-dark:invert rounded"></button></li>
    </ul>
    <div class="grow p-5 flex flex-col">
        <div class="flex pb-5 justify-center">
            {#if $showBackButton === true}
            <a href="../" on:click={()=>showBackButton.set(false)} class="hover:bg-stone-600 rounded text-center p-3 justify-self-start"><img src="/icons/arrowBack.svg" alt="Go Back"></a>
            {/if}
            <h1 class="font-bold text-2xl self-center justify-self-center grow">{currentPageName}</h1>
        </div>
        <slot></slot>
    </div>
</div>