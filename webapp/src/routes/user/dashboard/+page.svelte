<script lang="ts">
import { io } from "socket.io-client"
import { pageName } from "../../../stores";
import { derived, writable, type Writable } from "svelte/store";
    import { setupPageDefault } from "$lib/setupPageDefault";
    import List from "../../../lib/Components/list.svelte";
    import ValueBig from "./valueBig.svelte";
    import ValueSmall from "./valueSmall.svelte";
    import Button from "../../../lib/Components/button.svelte";
    import Estela from "./estela.svelte";
    import Cell from "../../../lib/Components/cell.svelte";

setupPageDefault();
pageName.set("Dashboard");
export let data;
let dataFrameStructure: any[] = data.dataFrameStructure;
let displayDataFrameStructures: any[] = dataFrameStructure.filter(x => x.display != 0);

const socket = io();

let boatData:any = writable(data.dataFrame);
socket.on('dataUpdate', (message) => {
    boatData.set(message);
});

//status variables and 
let defaultStatusColor:Writable<string> = writable("");
let statusColor:Writable<string> = writable("text-red-600");
let statusColorMTU: string = "";
let statusColorGPS: string = "";
let statusColorMPPT: string = "";

const currentDate = new Date();
let timeSinceLastFrame: Writable<number> = writable(Math.round(currentDate.getTime()/1000)+7200 - $boatData.UnixTime);
setInterval(()=> {
    const currentDate = new Date();
    timeSinceLastFrame.set(Math.round(currentDate.getTime()/1000)+7200 - $boatData.UnixTime);
    //give a sign if there hasn't been a message in a while
    if ($timeSinceLastFrame > 20) statusColor.set("text-red-600")
    else statusColor.set("");
},1000);

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

let leftValueList   = createList(ValueBig, displayDataFrameStructures.filter((id, idx, arr) => idx % 2 == 0), boatData)
let rightValueList  = createList(ValueBig, displayDataFrameStructures.filter((id, idx, arr) => idx % 2 == 1), boatData)
//create dummy list if there are uneven properties
if (displayDataFrameStructures.length % 2 === 1) {
    rightValueList.push({component: ValueBig, props:{data:{}, currentValue:writable(0), isDummy: true, statusColor: defaultStatusColor}})
}

let statusValues = [
    dataFrameStructure.filter(x => x.abbreviation === "gpsT")[0],
    dataFrameStructure.filter(x => x.abbreviation === "mtuT")[0],
    dataFrameStructure.filter(x => x.abbreviation === "mpptT")[0]
]

let statusList = createList(ValueSmall, statusValues, boatData)
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

async function resetDistance(): Promise<any> {
    let confirmation: boolean = confirm("are you sure you want these changes?");
    if (confirmation === true) {
        const response = await fetch('/user/dashboard/REST', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        socket.emit("newData")
    }
}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-3">
    <!-- top row -->
    <div class="flex justify-evenly space-x-3">
        <List elements={leftValueList} />
        <List elements={rightValueList} />
        <Estela />
    </div>

    <!-- status block -->
    <div class="flex space-x-3">
        <Cell>
            <div class="font-bold pb-3">Status</div>
            <List elements={statusList}></List>
        </Cell>
        
        <Cell>
            <div class="font-bold pb-3">control</div>
            <Button onclick={resetDistance} props={{hoverColour:"bg-red-400"}}>Reset Distance travelled</Button>
        </Cell>
    </div>
    
</div>