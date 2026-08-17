<script lang="ts">
    import "../app.css";

    import { listen } from '@tauri-apps/api/event';
    import { onMount } from "svelte";
    import { pageName, showBackButton } from "../stores";
    import { getDb } from '$lib/IOconnections/DBO/databaseObject';

    import { parseCANmessage } from '$lib/IOconnections/CANbusParsing';
    import { convertMQTTToRawCANbusMessages } from '$lib/IOconnections/MQTT/MQTTparser';
    import { canSchema, datadescription, liveData } from './ConnectionStores';
    import { fetchConnectionStores } from '$lib/fetchConnectionStores';
    import SettingsIcon from "$lib/Components/icons/settingsIcon.svelte";
    import DashboardIcon from "$lib/Components/icons/dashboardIcon.svelte";
    import GraphIcon from "$lib/Components/icons/graphIcon.svelte";
    import NewRouteIcon from "$lib/Components/icons/newRouteIcon.svelte";
    import ConnectionIcon from "$lib/Components/icons/connectionIcon.svelte";
    
    let { children } = $props();

    let currentPageName: string = $state("Page");
    let mqttConnected: { connected: boolean; color: string } = $state({connected: false, color: "bg-red-400"});

    pageName.subscribe((value) => {
        currentPageName = value;
    });

    let mqttStatusUnlisten: any = null;
    let mqttDataUnlisten: any   = null;
    onMount(async () => {
        await fetchConnectionStores(datadescription, canSchema, liveData);

        mqttStatusUnlisten = listen('mqtt-status', (e) => {
            console.log('Received MQTT status:', e.payload);
            mqttConnected = {connected: e.payload === "connected", color: e.payload === "connected" ? "bg-teal-500" : "bg-red-400" };
        });

        mqttDataUnlisten = listen('mqtt-data', async (e: any) => {
            console.log('Received MQTT data:', e.payload);
            const db = await getDb();
            const canFrames = convertMQTTToRawCANbusMessages(e.payload.payload);
            // parsing CANbus messages
            const dataObj = Object.assign({}, ...canFrames.map(frame => {
                return parseCANmessage(frame.id, frame.payload, $canSchema)
            }))

            //inserts values into the database and updates the liveData object
            const curDate = new Date()
            Object.keys(dataObj)
            .map(async (key: string) => {
                liveData.update((xs: any) => {
                xs[key] = dataObj[key]
                return xs
                })
                await db.execute('INSERT INTO Data Values ( ? , ? , ? )', [curDate.getTime(), key, dataObj[key]]);
            })
            liveData.update((xs: any) => {
                xs["UnixTime"] = curDate.getTime()
                return xs
            })
        });
    });
</script>

<div class="flex">
    <ul class="sticky top-0 shrink-0 flex flex-col p-2 w-16 h-screen bg-stone-200 dark:bg-stone-800 text-center space-y-3">
        <li class=""><a href="./dashboard"><DashboardIcon/></a></li>
        <li class="flex-1"><a href="./analyzation"><GraphIcon/></a></li>
        <li class="justify-self-end"><a href="./navigation-generator"><NewRouteIcon/></a></li>
        <li class="justify-self-end relative"><a href="./connection">
            <ConnectionIcon/>
            <!-- <img src="/icons/connection.svg" alt="Logout" class="p-2 hover:bg-stone-700 not-dark:invert rounded"> -->
            <span class="{mqttConnected.color} absolute top-0 end-0 size-3 rounded-full transform-translate-y-1/2 translate-x-1/2"></span>
        </a></li>
        <li class="justify-self-end"><a href="./settings"><SettingsIcon/></a></li>
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