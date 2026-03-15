<script lang="ts">
    import { derived } from "svelte/store";
    import { datadescription, liveData } from "../../../routes/ConnectionStores";
    import { clock } from "../../../stores";

    export let props: any
    let name = props.valueId
    let statusColor= props.statusColor
    let DateNowDiff= props.DateNowDiff

    function chooseValueFromData(latestData: any, currentTime: number, id: any) {
        if (DateNowDiff) {
            return Math.floor((currentTime - latestData[id])/1000) 
        }
        return latestData[id]
    }

    const description = derived(datadescription, (xs: any) => {
        if (name === "UnixTime") {
            if (DateNowDiff) return ({id: "UnixTime", name:"Last frame", unit: "s ago"})
            else return ({id:"UnixTime", name:"UnixTime", unit: "s"})
        }
        return xs.filter((x :any) => x.name == name)[0]
    })
    const latestValue = derived([liveData, clock, description], ([$latestData, $clock, $description]) => chooseValueFromData($latestData, $clock, $description.id))
</script>

<div class="flex flex-row items-end justify-between p-2 {$statusColor}">
    <p class="pr-1">{$description.name}:</p>
    <div class="flex">
        <p class="">{$latestValue ?? "-"}</p>
        <p class="grow">{$description.unit}</p>
    </div>
</div>