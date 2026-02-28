<script lang="ts">
    import { pageName, showBackButton } from "../stores";
    import { derived, writable } from "svelte/store";
    import { listen } from '@tauri-apps/api/event';
    import "../app.css";
    import { onMount } from "svelte";
    import { MQTTconnected } from "./ConnectionStores";
    
    let { children } = $props();

    let currentPageName: string = $state("Page");
    pageName.subscribe((value) => {
        currentPageName = value;
    });


    const connectionColor = derived(MQTTconnected, (conn) => {
        if (conn) return "bg-teal-500"
        else return "bg-red-400"
    }) 

    onMount(() => {
        // Listen to all notifications from the mqtt plugin to get connection statusses
        listen('plugin://mqtt', (event: any) => {
            if (event.payload.event.connect !== undefined) {
                MQTTconnected.set(true)
                return
            }
            if (event.payload.event.disconnect !== undefined) {
                if ($MQTTconnected) alert("MQTT has been disconnected")
                MQTTconnected.set(false)
                return
            }
        })
    })
</script>

<div class="flex">
    <ul class="sticky top-0 shrink-0 flex flex-col p-3 h-screen bg-stone-200 dark:bg-stone-800 text-center space-y-3">
        <li class=""><a href="./dashboard"><img src="/icons/dashboard.svg" alt="Dashboard" class="p-2 hover:bg-stone-700 not-dark:invert rounded"></a></li>
        <li class="flex-1"><a href="./analyzation"><img src="/icons/graph.svg" alt="analyzation" class="p-2 hover:bg-stone-700 not-dark:invert rounded"></a></li>
        <li class="justify-self-end relative"><a href="./connection">
            <img src="/icons/connection.svg" alt="Logout" class="p-2 hover:bg-stone-700 not-dark:invert rounded">
            <span class="{$connectionColor} absolute top-0 end-0 size-3 rounded-full transform-translate-y-1/2 translate-x-1/2"></span>
        </a></li>
        <li class="justify-self-end"><a href="./settings"><img src="/icons/settings.svg" alt="Settings" class="p-2 hover:bg-stone-700 not-dark:invert rounded"></a></li>
    </ul>

    <div class="grow p-5 flex flex-col">
        <div class="flex pb-5 justify-center">
            {#if $showBackButton === true}
            <a href="../" onclick={()=>showBackButton.set(false)} class="hover:bg-stone-600 rounded text-center p-3 justify-self-start"><img src="/icons/arrowBack.svg" alt="Go Back"></a>
            {/if}
            <h1 class="font-bold text-2xl self-center justify-self-center grow">{currentPageName}</h1>
        </div>
        {@render children()}
    </div>
</div>