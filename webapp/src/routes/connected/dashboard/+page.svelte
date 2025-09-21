<script lang="ts">
import { pageName } from "../../../stores";
import {writable, type Writable } from "svelte/store";
import { setupPageDefault } from "$lib/setupPageDefault";
import List from "$lib/DashboardBuilder/Components/list.svelte";
import ValueSmall from "./valueSmall.svelte";
import Cell from "$lib/Components/cell.svelte";
import BatteryCellGraph from "$lib/Components/batteryCellGraph.svelte";
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
let displayDataFrameStructures: any[] = []
let leftValueList: any;
let rightValueList: any;

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

//status variables and  time
let defaultStatusColor:Writable<string> = writable("");
let statusColor:Writable<string> = writable("text-red-600");
let statusColorMTU: string = "";
let statusColorGPS: string = "";
let statusColorMPPT: string = "";

const currentDate = new Date();
let timeSinceLastFrame: Writable<number> = writable((currentDate.getTime()+7200 - $latestData.UnixTime));
setInterval(()=> {
    const currentDate = new Date();
    timeSinceLastFrame.set(Math.round((currentDate.getTime()+7200 - $latestData.UnixTime)/1000));
    //give a sign if there hasn't been a message in a while
    if ($timeSinceLastFrame > 20) statusColor.set("text-red-600")
    else statusColor.set("");
},1000);

let statusValues: any[] = [
//     dataFrameStructure.filter(x => x.abbreviation === "mtuT")[0],
//     // dataFrameStructure.filter(x => x.abbreviation === "mpptT")[0],
//     // dataFrameStructure.filter(x => x.abbreviation === "gpsT")[0],
//     // dataFrameStructure.filter(x => x.abbreviation === "escT")[0]
]

let statusList = []
statusList.push({
    component: ValueSmall, 
    props: {
        data: {name: "Last Frame", unit: "s ago"}, 
        currentValue: timeSinceLastFrame, 
        isDummy:false,
        statusColor: statusColor
    }
})

statusList.reverse()

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

    <!-- <div class="flex space-x-3">
        <BatteryCellGraph bind:voltages={voltages} bind:isBalancingList={isBalancingList}/>
    </div> -->
    
    <!-- status block -->
    <div class="flex space-x-3">
        <Cell>
            <div class="font-bold pb-3">Status</div>
            <List elements={statusList}></List>
        </Cell>
        
        <!-- <Cell>
            <div class="font-bold pb-3">control</div>
            <Button onclick={resetDistance} props={{hoverColour:"bg-red-400"}}>Reset Distance travelled</Button>
        </Cell> -->
    </div>

    <DashboardConfigUploader />
    
    {/await}
    
</div>