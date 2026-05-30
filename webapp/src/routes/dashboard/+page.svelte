<script lang="ts">
import { pageName } from "../../stores";
import { setupPageDefault } from "$lib/setupPageDefault";
import { onDestroy, onMount } from "svelte";
import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";
import { listen } from "@tauri-apps/api/event";
import { db } from "$lib/IOconnections/DBO/databaseObject";
import DashboardBuilder from "$lib/DashboardBuilder/Components/DashboardBuilder.svelte";
import { getlayoutConfig } from "$lib/DashboardBuilder/LayoutConfig";
import { datadescription, liveData } from "../ConnectionStores";
import DashboardConfigUploader from "$lib/DashboardBuilder/Components/DashboardConfigUploader.svelte";
import { parseCANmessages } from "$lib/IOconnections/MQTT/MQTTparser";
    import { parseCANmessage } from "../../lib/IOconnections/Peak-can";

setupPageDefault();
pageName.set("Dashboard");

let tagToIdDict: any = {};
let canSchema: any = {};

let DashboardLayout:any;

async function fetchDataDescriptionFromDb() {
    DashboardLayout = await getlayoutConfig();

    datadescription.set(await db.select('SELECT * FROM DataDescription'));

    //fill the tagToIdDict
    $datadescription.map((x) => {
        tagToIdDict[x.tag] = x.id
    })

    //fill the canschema values
    canSchema = Object.groupBy($datadescription, ({ CANid }) => CANid)
    // sort on CAN position
    Object.keys(canSchema).forEach(key => {
        canSchema[key] = canSchema[key].sort((a: any, b: any) => a.CANmsgPosition - b.CANmsgPosition)
    });

    // fetch time of last update
    const lastMsgTime: any[] = await db.select('SELECT max(UnixTime) as UnixTime FROM Data')
    liveData.update((xs: any) => {
        xs["UnixTime"] = lastMsgTime[0].UnixTime
        return xs
    })
}

let unlistenPeakCan: any
let unlistenMqtt: any

onMount(async () => {
    unlistenMqtt = await mqtt.listen(async (x: any) => {
        try {
            const payload = x.payload.event.message.payload
            
            const dataObj = parseCANmessages(x, canSchema)
            const curDate = new Date()
            Object.keys(dataObj).map(async (key: string) => {
                await db.execute('INSERT INTO Data Values ( ? , ? , ? )', [curDate.getTime(), key, dataObj[key]]);
                liveData.update((xs: any) => {
                    xs[key] = dataObj[key]
                return xs
                })
            })
            liveData.update((xs: any) => {
                xs["UnixTime"] = curDate.getTime()
                return xs
            })
        } catch (error) {
            console.log(x)
        }
    });

    unlistenPeakCan = await listen('can-frame', (event : any) => {
        try {
            const frame = event.payload
            const dataObj = parseCANmessage(frame.id, frame.data, canSchema)

            const curDate = new Date()
            Object.keys(dataObj).map(async (key: string) => {
                await db.execute('INSERT INTO Data Values ( ? , ? , ? )', [curDate.getTime(), key, dataObj[key]]);
                liveData.update((xs: any) => {
                    xs[key] = dataObj[key]
                return xs
                })
            })
            liveData.update((xs: any) => {
                xs["UnixTime"] = curDate.getTime()
                return xs
            })
        } catch (error) {
            console.log(error)
        }
    })
});

onDestroy(async () => {
    await unlistenMqtt()
    await unlistenPeakCan()
})
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-3">
    <!-- top row -->
    {#await fetchDataDescriptionFromDb()}
        loading..
    {:then}
    
    <DashboardBuilder/>
    <DashboardConfigUploader />
    
    {/await}
    
</div>