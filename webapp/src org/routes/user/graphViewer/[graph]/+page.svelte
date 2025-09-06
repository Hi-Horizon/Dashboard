<script lang="ts" type="module">
import Chart from 'chart.js/auto';
import { pageName, showBackButton } from "../../../../stores";
import type { PageData } from "./$types";
import { onMount } from 'svelte';
import { setupPageDefault } from '$lib/setupPageDefault';
import 'chartjs-adapter-luxon';
import { getRelativePosition } from 'chart.js/helpers';
import { chartConfig, linearScaleConfig, timeScaleConfig } from './chartConfig';
    import { writable } from 'svelte/store';

export let data: PageData;

setupPageDefault();
pageName.set(data.graphName);
showBackButton.set(true);

let xAxesOption:string;
let yAxesOption:string;
let GraphType:string;

let xName: string = ""
const minInterval: number = data.recordingInterval.begin
const maxInterval: number = data.recordingInterval.end
let beginInterval: number = minInterval
let endInterval: number = maxInterval

let chartCanvas: any;
let ctx: any;
export let chart:any

let dataURL: string;
let downloadLinkDOM: any;

const refreshingGraph = writable(false);

onMount(() => {
        ctx = chartCanvas.getContext('2d');
        chart = new Chart(ctx, chartConfig);
        fetchGraphDataPoints();
});

function resetInterval() {
    beginInterval = minInterval
    endInterval = maxInterval
}

function formatInterval(xPoint: number, xName: string) {
    return new Date(xPoint) 
}

// prepares and displays the data on a graph, with the chosen settings
async function displayNewGraph(x:any, y:any) {
    chartConfig.type = GraphType;
    let xDate = x.points.map((o:any) => o *= 1000);
    xName = x.name
    if (x.name === "UnixTime") chartConfig.options.scales.x = timeScaleConfig
    else chartConfig.options.scales.x = linearScaleConfig
    if (y.name === "UnixTime") chartConfig.options.scales.y = timeScaleConfig
    else chartConfig.options.scales.y = linearScaleConfig

    chartConfig.options.scales.x.title.text = x.name;
    chartConfig.data.labels = xDate
    chartConfig.options.scales.y.title.text = y.name;
    chartConfig.data.datasets[0].data = y.points;
    chart.destroy();
    chart = new Chart(ctx, chartConfig);
}

//gets data to be displayed to the graph
async function fetchGraphDataPoints() {
    refreshingGraph.set(true)
    const response = await fetch('./getGraphAPI?x='+xAxesOption+"&y="+yAxesOption+"&xs="+beginInterval+"&xe="+endInterval);
    const message = await response.json();

    refreshingGraph.set(false)
    displayNewGraph(message.x, message.y);
}

//gets date to download it to a .csv
async function downloadDataRange() {
    const response = await fetch('./getAllColumnsAPI');
    const message = await response.json();
    dataURL = message.table;
    downloadLinkDOM.href = dataURL
    downloadLinkDOM.click();
}

//gets xAxes for the interval, alternating between begin and end of the interval, starting at the beginPoint
//NOTE: can only happen if time is displayed on the xAxes
let getIntervalBegin: boolean = true
function getGraphPoint(e: MouseEvent) {
    const canvasPosition = getRelativePosition(e, chart)
    const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
    if (xName != "UnixTime") return
    if (getIntervalBegin) {
        beginInterval = dataX
    }
    else {
        endInterval = dataX
    }
    getIntervalBegin = !getIntervalBegin
}
</script>

<svelte:head>
    <title>GraphViewer - {data.graphName}</title>
</svelte:head>

<div class="flex flex-col items-start space-y-5 h-full">
    <div class="flex space-x-3 w-full h-full">
        <div class="flex flex-col w-1/6 space-y-3">
            <label for="X-axis" class="font-bold">X-axis</label>
            <select bind:value={xAxesOption} name="X-axis" class="p-3 rounded bg-stone-600">
                <option value="UnixTime">Time</option>
                {#each data.readStatisticTypes as readStatisticsType}
                    <option value={readStatisticsType.abbreviation}>{readStatisticsType.name}</option>
                {/each}
            </select>
            <label for="Y-axis" class="font-bold">Y-axis</label>
            <select bind:value={yAxesOption} name="Y-axis" class="p-3 rounded bg-stone-600">
                {#each data.readStatisticTypes as readStatisticsType}
                    <option value={readStatisticsType.abbreviation}>{readStatisticsType.name}</option>
                {/each}
                <option value="UnixTime">Time</option>
            </select>
            <label for="GraphType" class="font-bold">Graph Type</label>
            <select bind:value={GraphType} name="GraphType" class="p-3 rounded bg-stone-600">
                <option value="line">Line</option>
                <option value="scatter">Scatter</option>
                <option value="bar">Bar</option>
            </select>
            <div>
                <div class="font-bold">Interval</div>
                <div class="text-xs text-stone-400 font-thin">Click graph to select begin and end <br> NOTE: can only be adjusted with X-axis set to Time</div>
            </div>
            <div>
                <label for="startInterval" class="">Start Interval</label>
                <input value={formatInterval(beginInterval, xName)} name="startInterval" readonly class="p-2 rounded bg-stone-700 w-full">
                <label for="endInterval" class="">End Interval</label>
                <input value={formatInterval(endInterval, xName)} name="endInterval" readonly class="p-2 rounded bg-stone-700 w-full">
                <button on:click={()=>resetInterval()} class="mt-1 p-1 text-xs rounded bg-stone-500 hover:bg-stone-400">Reset Interval</button>
            </div>
            <button on:click={()=>fetchGraphDataPoints()} class="bg-stone-700 hover:bg-stone-600 rounded p-2">View</button>
            <button on:click={()=>downloadDataRange()} class="bg-green-700 hover:bg-green-600 rounded p-2 flex justify-center">
                <img src="/icons/download.svg" alt="download" class="self-start">
                <p>Save to .CSV</p>
            </button>
        </div>
        
        <div class="grow grid grid-cols-1 rounded-xl h-full bg-stone-800" style="grid-row-start: 1; grid-column-start: 1;">
            {#if $refreshingGraph}
                <div class=" flex justify-center items-center font-bold text-2xl z-10 bg-stone-900 bg-opacity-70" style="grid-area: 1/1;">
                    <div class="text-center">Loading...</div>
                </div>
            {/if}
            <canvas style="grid-area: 1/1;" bind:this={chartCanvas} on:click={(e) => getGraphPoint(e)} id="dataChart"></canvas>
        </div>
    </div>
</div>

<a download={data.graphName} href="./" bind:this={downloadLinkDOM} hidden>download</a>