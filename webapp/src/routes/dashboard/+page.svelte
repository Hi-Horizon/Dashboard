<script lang="ts">
import { pageName } from "../../stores";
import { derived, writable, type Readable, type Writable } from "svelte/store";
import { setupPageDefault } from "$lib/setupPageDefault";
    import List from "../../lib/Components/list.svelte";
    import ValueBig from "./valueBig.svelte";
    import ValueSmall from "./valueSmall.svelte";
    import Button from "../../lib/Components/button.svelte";
    import Cell from "../../lib/Components/cell.svelte";
    import Map from "../../lib/Components/map.svelte";
    import BatteryCellGraph from "../../lib/Components/batteryCellGraph.svelte";
    import { onMount } from "svelte";
import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";

setupPageDefault();
pageName.set("Dashboard");
// export let data;
// let dataFrameStructure: any[] = data.dataFrameStructure;
// let displayDataFrameStructures: any[] = dataFrameStructure.filter(x => x.display != 0);

// const socket = io();

let boatData:any = writable({test:0});
// socket.on('dataUpdate', (message) => {
//     boatData.set(message);
// });

onMount(() => {
    mqtt.listen((x: any) => {
        const payload = x.payload.event.message.payload
        const dataObj = JSON.parse(payload.map((x: any) => String.fromCharCode(x)).join(''))
        boatData.set(dataObj)
    });
});

//status variables and 
let defaultStatusColor:Writable<string> = writable("");
let statusColor:Writable<string> = writable("text-red-600");
let statusColorMTU: string = "";
let statusColorGPS: string = "";
let statusColorMPPT: string = "";

// const currentDate = new Date();
// let timeSinceLastFrame: Writable<number> = writable(Math.round(currentDate.getTime()/1000)+7200 - $boatData.UnixTime);
// let timeSinceLastGPSmsg: Writable<number> = writable(Math.round(currentDate.getTime()/1000)+7200 - $boatData.gpsT);
// let timeSinceLastESCmsg: Writable<number> = writable(Math.round(currentDate.getTime()/1000)+7200 - $boatData.escT);
// let timeSinceLastMPPTmsg: Writable<number> = writable(Math.round(currentDate.getTime()/1000)+7200 - $boatData.mpptT);
// setInterval(()=> {
//     const currentDate = new Date();
//     timeSinceLastFrame.set(Math.round(currentDate.getTime()/1000)+7200 - $boatData.UnixTime);
//     timeSinceLastGPSmsg.set(Math.round(currentDate.getTime()/1000)+7200 - $boatData[8]);
//     timeSinceLastESCmsg.set(Math.round(currentDate.getTime()/1000)+7200 - $boatData[56]);
//     timeSinceLastMPPTmsg.set(Math.round(currentDate.getTime()/1000)+7200 - $boatData[10]);
//     //give a sign if there hasn't been a message in a while
//     if ($timeSinceLastFrame > 20) statusColor.set("text-red-600")
//     else statusColor.set("");
// },1000);

// creating the data displays
function createList(component:any, descriptionsList:any[], ReactiveValuesObject: any) {
    return descriptionsList.map((element:any) => {
        return {
            component: component, 
            props: {
                data: element, 
                currentValue: derived(ReactiveValuesObject, (xs: any) => xs[element.id]), 
                isDummy:false,
                statusColor: defaultStatusColor
            }
        }
    });
}

// let displayDataFrameStructures = [{
    
// }]

// let leftValueList   = createList(ValueBig, displayDataFrameStructures.filter((id, idx, arr) => idx % 2 == 0), boatData)
// let rightValueList  = createList(ValueBig, displayDataFrameStructures.filter((id, idx, arr) => idx % 2 == 1), boatData)
// //create dummy list if there are uneven properties
// if (displayDataFrameStructures.length % 2 === 1) {
//     rightValueList.push({component: ValueBig, props:{data:{}, currentValue:writable(0), isDummy: true, statusColor: defaultStatusColor}})
// }

// let statusValues: any[] = [
//     dataFrameStructure.filter(x => x.abbreviation === "mtuT")[0],
//     // dataFrameStructure.filter(x => x.abbreviation === "mpptT")[0],
//     // dataFrameStructure.filter(x => x.abbreviation === "gpsT")[0],
//     // dataFrameStructure.filter(x => x.abbreviation === "escT")[0]
// ]

// let statusList = createList(ValueSmall, statusValues, boatData)
// statusList.push({
//     component: ValueSmall, 
//     props: {
//         data: {name: "Last MPPT msg", unit: "s ago"}, 
//         currentValue: timeSinceLastMPPTmsg, 
//         isDummy:false,
//         statusColor: defaultStatusColor
//     }
// })
// statusList.push({
//     component: ValueSmall, 
//     props: {
//         data: {name: "Last GPS msg", unit: "s ago"}, 
//         currentValue: timeSinceLastGPSmsg, 
//         isDummy:false,
//         statusColor: defaultStatusColor
//     }
// })
// statusList.push({
//     component: ValueSmall, 
//     props: {
//         data: {name: "Last ESC msg", unit: "s ago"}, 
//         currentValue: timeSinceLastESCmsg, 
//         isDummy:false,
//         statusColor: defaultStatusColor
//     }
// })
// statusList.push({
//     component: ValueSmall, 
//     props: {
//         data: {name: "Last Frame", unit: "s ago"}, 
//         currentValue: timeSinceLastFrame, 
//         isDummy:false,
//         statusColor: statusColor
//     }
// })

// statusList.reverse()

// async function resetDistance(): Promise<any> {
//     let confirmation: boolean = confirm("are you sure you want these changes?");
//     console.log(confirmation)
//     if (confirmation === true) {
//         const response = await fetch('/user/dashboard/REST', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         if (response.status != 200) {
//             alert(response.status)
//         }
//         socket.emit("newData")
//     }
// }

// let positionCurrentVals = dataFrameStructure
//     .filter((element) => element.abbreviation == "lng" || element.abbreviation == "lat")
//     .map((element) => derived(boatData, (xs: any) => xs[element.id]))

//for testing purposes
// const average = (array: number[]) => array.reduce((a, b) => a + b) / array.length;
// let cellCount = 14
// let voltages = writable(Array.from({length: cellCount}, () => 3.6 + Math.random() * (0.2)));
// let isBalancingList = writable([...Array(cellCount).keys()].map(i => voltages[i] - average($voltages) > 0.05));
// setInterval(()=> {
//     voltages.set(voltages.map( x => x - Math.random()*0.03));
//     isBalancingList.set([...Array(cellCount).keys()].map(i => $voltages[i] - average($voltages) > 0.05));
// },1000);

// let voltageIds = [24,25,26,27,28,29,30,31,32,33,34,35,36,37]
// let voltages: Readable<number[]> = derived(boatData, (xs: any) => voltageIds.map((i: number) => xs[i]))

// let isBalancingListIds = [41,42,43,44,45,46,47,48,49,50,51,52,53,54]
// let isBalancingList: Readable<boolean[]> = derived(boatData, (xs: any) => isBalancingListIds.map((i: number) => xs[i]))
let testVal = derived(boatData, (xs: any) => xs.test)
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-3">
    <!-- top row -->
    <div class="flex justify-evenly space-x-3">
        <!-- <List elements={leftValueList} />
        <List elements={rightValueList} /> -->
        <ValueBig props={{data: {name: "test", unit:"t"}, currentValue: testVal, isDummy: false}}/>
        <!-- <Map elements={positionCurrentVals}/> -->
    </div>

    <div class="flex space-x-3">
        <!-- <BatteryCellGraph bind:voltages={voltages} bind:isBalancingList={isBalancingList}/> -->
    </div>
    
    <!-- status block -->
    <div class="flex space-x-3">
        <Cell>
            <div class="font-bold pb-3">Status</div>
            <!-- <List elements={statusList}></List> -->
        </Cell>
        
        <Cell>
            <div class="font-bold pb-3">control</div>
            <!-- <Button onclick={resetDistance} props={{hoverColour:"bg-red-400"}}>Reset Distance travelled</Button> -->
        </Cell>
    </div>
    
    
</div>