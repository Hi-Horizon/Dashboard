<script lang="ts">
import { pageName } from "../../../stores";
import { setupPageDefault } from "$lib/setupPageDefault";
import { onMount } from "svelte";
import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";
import { db } from "$lib/IOconnections/DBO/databaseObject";
import DashboardBuilder from "$lib/DashboardBuilder/Components/DashboardBuilder.svelte";
    import { getlayoutConfig } from "$lib/DashboardBuilder/LayoutConfig";
    import { datadescription, latestData } from "../ConnectionStores";
    import DashboardConfigUploader from "../../../lib/DashboardBuilder/Components/DashboardConfigUploader.svelte";

setupPageDefault();
pageName.set("Dashboard");

let tagToIdDict: any = {};

let DashboardLayout:any;

async function fetchDataDescriptionFromDb() {
    DashboardLayout = await getlayoutConfig();

    datadescription.set(await db.select('SELECT * FROM DataDescription'));

    //fill the tagToIdDict
    $datadescription.map((x) => {
        tagToIdDict[x.tag] = x.id
    })

    //fetch last seen values
    const lastMsgTime: any[] = await db.select('SELECT max(UnixTime) as UnixTime FROM Data')
    const maxTResult: any[] = await db.select('SELECT descriptionId as id, Value FROM Data WHERE Unixtime = (SELECT max(UnixTime) FROM Data)')
    maxTResult.forEach((result) => {
        latestData.update((xs: any) => {
            xs[result.id] = result.Value
            return xs
        })
    })
    latestData.update((xs: any) => {
        xs["UnixTime"] = lastMsgTime[0].UnixTime
        return xs
    })
}

onMount(() => {
    mqtt.listen(async (x: any) => {
        const payload = x.payload.event.message.payload
        const dataObj = JSON.parse(payload.map((x: any) => String.fromCharCode(x)).join(''))
        
        const curDate = new Date()
        
        Object.keys(dataObj).map(async (key: string) => {
            await db.execute('INSERT INTO Data Values ( ? , ? , ? )', [curDate.getTime(), tagToIdDict[key], dataObj[key]]);
            latestData.update((xs: any) => {
                xs[tagToIdDict[key]] = dataObj[key]
            return xs
            })
        })
        latestData.update((xs: any) => {
            xs["UnixTime"] = curDate.getTime()
            return xs
        })
    });
});
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