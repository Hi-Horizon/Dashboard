<script lang="ts">
    import { derived, writable } from "svelte/store";
    import { datadescription, liveData } from "../../../routes/ConnectionStores";
    import { clock } from "../../../stores";

    export let props: any
    let name = props.valueId
    let statusColor = writable("text-"+ props.statusColor)
    let unit = 's'
    // console.log($statusColor)
    const description = derived(datadescription, (xs: any) => {
        if (name === "UnixTime") {
            return {id: "UnixTime", name:"Time since latest data", unit: "s ago"}
        }
        return xs.filter((x :any) => x.name == name)[0]
    })

    const latestValue = derived([liveData, clock, description], ([$latestData, $clock, $description]) => {
        const seconds = Math.floor(($clock - $latestData[$description.id])/1000)
        if (seconds < 60) {
            unit = 's'
            return seconds
        }
        if (seconds < 3600) {
            unit = 'm'
            return Math.floor(seconds / 60)
        }
        unit = 'h'
        return Math.floor(seconds / 3600)
    })
    $: {
        if ($latestValue > 10 || unit != 's') statusColor.set("text-"+ props.statusColor)
        else statusColor.set("")
    }
</script>

<div class="flex flex-row items-end justify-between p-2 {$statusColor}">
    <p class="pr-1">{$description.name}:</p>
    <div class="flex">
        <p class="">{$latestValue}</p>
        <p class="grow">{unit}</p>
    </div>
</div>