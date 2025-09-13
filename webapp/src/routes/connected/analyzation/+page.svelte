<script lang="ts" module>
import { pageName } from "../../../stores";
import { onMount } from 'svelte';
import { setupPageDefault } from '$lib/setupPageDefault';
import 'chartjs-adapter-luxon';
import { writable } from 'svelte/store';
import { getDataTableWithRange } from "$lib/graphs/getDataPoints";

setupPageDefault();
pageName.set("Analyzation");

let xAxesOption:string;
let yAxesOption:string;
let GraphType:string;

let xName: string = ""

let chartCanvas: any;
let ctx: any;

let dataURL: string;
let downloadLinkDOM: any;

//gets date to download it to a .csv
async function downloadDataRange() {
    const data = await getDataTableWithRange();
    let rawString:string = '';
    //add keys
    rawString += (Object.keys(data[0]).join(',') + '\n')
    //add rows
    for (const row of data) {
        rawString += (Object.values(row).join(',') + '\n');
    }
    var b64str = btoa(rawString);
    var src = 'data:text/csv;base64,' + b64str;
    dataURL = src.toString();
    downloadLinkDOM.href = dataURL
    downloadLinkDOM.click();
    alert("download succesful")
}

</script>

<svelte:head>
    <title>Analyzation</title>
</svelte:head>

<div class="flex flex-col items-start space-y-5 h-full">
            <button on:click={()=>downloadDataRange()} class="bg-green-700 hover:bg-green-600 rounded p-2 flex justify-center">
                <img src="/icons/download.svg" alt="download" class="self-start">
                <p>Save to .CSV</p>
            </button>
</div>

<a download={"data-dump"+ Date().toString()} href="./" bind:this={downloadLinkDOM} hidden>download</a>