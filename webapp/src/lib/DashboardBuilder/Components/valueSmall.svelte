<script lang="ts">
    import { derived } from "svelte/store";
    import { datadescription, latestData } from "../../../routes/connected/ConnectionStores";
    import { clock } from "../../../stores";

    export let props: any
    let id = props.valueId
    let statusColor= props.statusColor
    let DateNowDiff= props.DateNowDiff

    function chooseValueFromData(latestData: any, currentTime: number, id: any) {
        if (DateNowDiff) {
            return Math.floor((currentTime - latestData[id])/1000) 
        }
        return latestData[id]
    }

    const description = derived(datadescription, (xs: any) => {
        if (id === "UnixTime") {
            if (DateNowDiff) return ({name:"Last frame", unit: "s ago"})
            else return ({name:"UnixTime", unit: "s"})
        }
        return xs.filter((x :any) => x.id == id)[0]
    })
    const latestValue = derived([latestData, clock], ([$latestData, $clock]) => chooseValueFromData($latestData, $clock, id))
</script>

<div class="flex flex-row items-end justify-between p-2 {$statusColor}">
    <p class="pr-1">{$description.name}:</p>
    <div class="flex">
        <p class="">{$latestValue}</p>
        <p class="grow">{$description.unit}</p>
    </div>
</div>