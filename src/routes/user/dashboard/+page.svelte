<script lang="ts">
import { io } from "socket.io-client"
import { pageName } from "../../../stores";
import { writable, type Writable } from "svelte/store";
    import { setupPageDefault } from "$lib/setupPageDefault";

setupPageDefault();
pageName.set("Dashboard");
export let data;
let dataFrameStructure: any[] = data.dataFrameStructure;
let displayDataFrameStructures: any[] = dataFrameStructure.filter(x => x.display != 0);
const socket = io();

let boatData:any = data.dataFrame;
socket.on('dataUpdate', (message) => {
    boatData = message;
});

let statusColor: string = "";
let statusColorMTU: string = "";
let statusColorGPS: string = "";
let statusColorMPPT: string = "";
const currentDate = new Date();
let timeSinceLastFrame: Writable<number> = writable(Math.round(currentDate.getTime()/1000)+7200 - boatData.UnixTime);

//********************ESTELA LINK HERE ************************/
let link: string = "https://estela.co/nl/tracking-race/13452/solar-racing-2024-nk-groenleven-zonnebootrace-rondje-akkrum";
//********************ESTELA LINK HERE ************************/

setInterval(()=> {
    const currentDate = new Date();
    timeSinceLastFrame.set(Math.round(currentDate.getTime()/1000)+7200 - boatData.UnixTime);
},1000);

$: {
    if ($timeSinceLastFrame > 20) statusColor = "text-red-600"
    else statusColor="";
};

</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-3">
    <div class="flex justify-evenly space-x-3">
        <div class="rounded border-separate bg-stone-800 flex-1">
        {#each displayDataFrameStructures as readStatistic, index}
            {#if readStatistic.name !== "UnixTime"}
                {#if index < (displayDataFrameStructures.length/2)}
                    <div class="even:bg-stone-700 p-3 last:rounded-b">
                        <p class="font-bold">{readStatistic.name}</p>
                        <div class="flex flex-row items-end space-x-1">
                            <p class="text-4xl">{boatData[readStatistic.abbreviation].toFixed(2)}</p>
                            <p class="text-stone-400">{readStatistic.unit}</p>
                        </div>
                    </div>
                {/if}
            {/if}
        {/each}
        </div>
        <div class="rounded border-separate bg-stone-800 flex flex-col flex-1" >
        {#each displayDataFrameStructures as readStatistic, index}
            {#if readStatistic.name !== "UnixTime"}
                {#if index >= (displayDataFrameStructures.length/2)}
                    <div class="even:bg-stone-700 p-3 last:rounded-b">
                        <p class="font-bold">{readStatistic.name}</p>
                        <div class="flex flex-row items-end space-x-1">
                            <p class="text-4xl">{boatData[readStatistic.abbreviation].toFixed(2)}</p>
                            <p class="text-stone-400">{readStatistic.unit}</p>
                        </div>
                    </div>
                {/if}
            {/if}
        {/each}
        {#if displayDataFrameStructures.length % 2 === 1}
            <div class="even:bg-stone-700 p-3 last:rounded-b flex-grow">
            </div>
        {/if}
        </div>
        <div>
            Current/Most recent race:
            <iframe width="560" height="315" src={link} frameborder="0" allowfullscreen></iframe>
        </div>
    </div>
    <div class="p-3 rounded bg-stone-800 self-start w-fit">
        <div class="font-bold">Status</div>
        <div class="{statusColor}">Time since last Frame: {$timeSinceLastFrame}s</div>
        <div class="{statusColorGPS}">MTU runtime: {boatData["mtuT"]}s</div>
        <div class="{statusColorGPS}">Time since last GPS data: {boatData["gpsT"]}s</div>
        <div class="{statusColorMPPT}">Time since last MPPT data: {boatData["mpptT"]}s</div>
    </div>
</div>