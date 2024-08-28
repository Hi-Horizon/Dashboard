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
function changeLink() {
    link = inputLink;
}

let inputLink: string = "";
let link: string = "";
//********************ESTELA LINK HERE ************************/

setInterval(()=> {
    const currentDate = new Date();
    timeSinceLastFrame.set(Math.round(currentDate.getTime()/1000)+7200 - boatData.UnixTime);
},1000);

$: {
    if ($timeSinceLastFrame > 20) statusColor = "text-red-600"
    else statusColor="";
};

async function resetDistance(): Promise<any> {
    let confirmation: boolean = confirm("are you sure you want these changes?");
    if (confirmation === true) {
        const response = await fetch('/user/dashboard/REST', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-3">
    <div class="flex justify-evenly space-x-3">
        <div class="rounded border-separate flex-1 flex flex-col">
        {#each displayDataFrameStructures as readStatistic, index}
            {#if readStatistic.name !== "UnixTime"}
                {#if index < (displayDataFrameStructures.length/2)}
                    <div class="even:bg-stone-700 odd:bg-stone-800 p-3 last:rounded-b first:rounded-t flex-grow flex flex-col justify-center">
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
        <div class="rounded border-separate flex flex-col flex-1" >
        {#each displayDataFrameStructures as readStatistic, index}
            {#if readStatistic.name !== "UnixTime"}
                {#if index >= (displayDataFrameStructures.length/2)}
                    <div class="even:bg-stone-700 odd:bg-stone-800 p-3 last:rounded-b first:rounded-t flex-grow flex flex-col justify-center">
                        <p class="font-bold">{readStatistic.name}</p>
                        <div class="flex flex-row items-end space-x-1">
                            <p class="text-4xl">{boatData[readStatistic.abbreviation].toFixed(2)}</p>
                            <p class="text-stone-400 flex-grow">{readStatistic.unit}</p>
                            {#if readStatistic.name === "Meters travelled"}
                            <button on:click={()=>resetDistance()} class="p-1 text-s text-center bg-stone-500 hover:bg-red-400 rounded">
                                Reset
                            </button>
                            {/if}
                        </div>
                    </div>
                {/if}
            {/if}
        {/each}
        {#if displayDataFrameStructures.length % 2 === 1}
            <div class="even:bg-stone-700 p-3 last:rounded-b flex-grow">
                <p class="font-bold text-stone-700">dummy</p>
                <div class="flex flex-row items-end space-x-1">
                    <p class="text-4xl text-stone-700">hi</p>
                    <p class="text-stone-700">l</p>
                </div>
            </div>
        {/if}
        </div>
        <div class="rounded bg-stone-800 p-3">
            <!-- Current/Most recent race: -->
            <div class="rounded bg-stone-900">
                <iframe title="estela tracker" width="560" height="315" src={link} frameborder="0" allowfullscreen>track the race by filling in a link down below</iframe>
            </div>
            <div class="flex pt-3 space-x-1">
                <input type="text" bind:value={inputLink} placeholder="https://estela.co/...." class="rounded bg-stone-700 px-2 flex-1 placeholder:italic">
                <button on:click={changeLink} class="text-center bg-stone-700 hover:bg-stone-600 rounded flex justify-center py-1 px-4">Watch</button>
            </div>
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