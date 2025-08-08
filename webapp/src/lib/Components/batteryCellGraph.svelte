<script lang="ts" type="module">
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { onMount } from 'svelte';
import { get, type Readable, type Writable, writable } from 'svelte/store';

export let voltages: Readable<number[]>
export let isBalancingList: Readable<boolean[]>

let cellCount = $voltages.length
let labels = [...Array(cellCount).keys()].map( i => "Cell " + (i + 1))

let batteryCellGraphConfig:any = {
    type: 'bar',
    data: {
            labels: labels,
            datasets: [{
                    label: "none",
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: [],
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
            }]
    },
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: false,
                    text: "cell group"
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Voltage (V)"
                },
                type: "linear",
                max: 4.5
            }
        },
        plugins: {
            datalabels: {
                color: 'white',
                display: true,
                font: {
                    weight: 'bold'
                },
                formatter: function(value:number) {
                    return value.toFixed(3);
                }
            },
            legend: {
                display: false
            }
        },
    }
}

let chartCanvas: any;
let ctx: any;
let chart:any

const refreshingGraph = writable(true);

onMount(() => {
    ctx = chartCanvas.getContext('2d');
    chart = new Chart(ctx, batteryCellGraphConfig);
    updateGraph($voltages, $isBalancingList);
    refreshingGraph.set(false)
});

// prepares and displays the data on a graph, with the chosen settings
async function displayNewGraph(y:number[], isbalancingList:boolean[]) {
    batteryCellGraphConfig.data.datasets[0].data = y;
    batteryCellGraphConfig.data.datasets[0].backgroundColor = isbalancingList.map( 
        x => {
            if (x) return "orange"
            else   return "rgb(220, 38, 38)"
        }
    )

    chart.destroy();
    chart = new Chart(ctx, batteryCellGraphConfig);
}

//updates graph with new values
async function updateGraph(y:number[], isbalancingList:boolean[]) {
    batteryCellGraphConfig.data.datasets[0].data = y;
    batteryCellGraphConfig.data.datasets[0].backgroundColor = isbalancingList.map( 
        x => {
            if (x) return "orange"
            else   return "rgb(220, 38, 38)"
        }
    )
    chart.update();
}

$: {
    if (chart !== undefined) updateGraph($voltages, $isBalancingList);
}
</script>

<div class="flex-grow grid grid-cols-1 rounded-xl h-96 bg-stone-800 p-4" style="grid-row-start: 1; grid-column-start: 1;">
    {#if $refreshingGraph}
    <div class=" flex justify-center items-center font-bold text-2xl z-10 bg-stone-900 bg-opacity-70" style="grid-area: 1/1;">
        <div class="text-center">Loading...</div>
    </div>
    {/if}
    <canvas style="grid-area: 1/1;" bind:this={chartCanvas} id="batteryCellGraph"></canvas>
</div>