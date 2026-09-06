<script lang="ts">
import { pageName } from "../../stores";
import { setupPageDefault } from '$lib/setupPageDefault';
import { getDataTableWithRange } from "$lib/graphs/getDataPoints";
    import Cell from "$lib/Components/cell.svelte";
    import { DateInput, DatePicker } from "date-picker-svelte";

setupPageDefault();
pageName.set("Analyzation");

let dataURL: string;
let downloadLinkDOM: any;

let fromdate = new Date()
let untildate = new Date()

//gets date to download it to a .csv
async function downloadDataRange() {
    console.log("starting download")
    const data = await getDataTableWithRange(fromdate.getTime(), untildate.getTime());
    if (data.length === 0) {
        alert("No data found in this time period")
        return
    }

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
    alert("The download was succesful")
}

</script>

<svelte:head>
    <title>Analyzation</title>
</svelte:head>

<div class="flex flex-col items-start space-y-5 h-full">
    <Cell>
        <p class="text-left font-bold text-lg">Export data</p>
        <div class="flex space-x-2 mt-3">    
            <DateInput bind:value={fromdate} timePrecision="second"/>
            <!-- <h2>-</h2> -->
            <DateInput bind:value={untildate} timePrecision="second"/>
        </div>
        <button on:click={()=>downloadDataRange()} class="bg-green-700 hover:bg-green-600 text-stone-50 rounded p-3 mt-1 flex justify-center">
            <img src="/icons/download.svg" alt="download" class="size-6">
            <p class="pl-2">Save to CSV</p>
        </button>
    </Cell>
</div>

<a download={"data-dump"+ Date().toString()} href="./" bind:this={downloadLinkDOM} hidden>download</a>