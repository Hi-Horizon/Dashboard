<script lang="ts">
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { onMount } from 'svelte';
import { derived, get, type Readable, type Writable, writable } from 'svelte/store';
import { datadescription, liveData } from '../../../routes/ConnectionStores';

export let props
const cell_voltage_vars: string[] = props.cell_voltage_vars
const cell_isbalancing_var: string = props.cell_isbalancing_var

const cellVoltageArr: Readable<number[]> = derived([liveData, datadescription], ([$liveData, $datadescription]) => {
    const descriptions = cell_voltage_vars.map(varName => 
        $datadescription.filter((x :any) => x.name == varName)[0]
    )
    return descriptions.map(description => $liveData[description.id])
})

const isBalancingArr: Readable<boolean[]> = derived([liveData, datadescription], ([$liveData, $datadescription]) => {
    const description = $datadescription.filter((x :any) => x.name == cell_isbalancing_var)[0]
    let result: boolean[] = []
    
    // get every bit value of the integer by shifting to left and masking with lowest order bit
    for (let i = 0; i < 14; i++) {
        result.push(Boolean(($liveData[description.id] >> i) & 0b1))
    }
    return result
})

let cellCount = cell_voltage_vars.length
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
                    return (value ?? 0).toFixed(3);
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
    updateGraph($cellVoltageArr, $isBalancingArr);
    refreshingGraph.set(false)
});

// prepares and displays the data on a graph, with the chosen settings
async function displayNewGraph(cellVoltageArr:number[], isbalancingList:boolean[]) {
    batteryCellGraphConfig.data.datasets[0].data = cellVoltageArr;
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
async function updateGraph(cellVoltageArr:number[], isbalancingList:boolean[]) {
    batteryCellGraphConfig.data.datasets[0].data = cellVoltageArr;
    batteryCellGraphConfig.data.datasets[0].backgroundColor = isbalancingList.map( 
        x => {
            if (x) return "orange"
            else   return "rgb(220, 38, 38)"
        }
    )
    chart.update();
}

$: {
    if (chart !== undefined) updateGraph($cellVoltageArr, $isBalancingArr);
}
</script>

<div class="grow grid grid-cols-1 rounded-xl h-96 bg-stone-200 dark:bg-stone-800 p-4" style="grid-row-start: 1; grid-column-start: 1;">
    {#if $refreshingGraph}
    <div class=" flex justify-center items-center font-bold text-2xl z-10 bg-stone-900 bg-opacity-70" style="grid-area: 1/1;">
        <div class="text-center">Loading...</div>
    </div>
    {/if}
    <canvas style="grid-area: 1/1;" bind:this={chartCanvas} id="batteryCellGraph"></canvas>
</div>