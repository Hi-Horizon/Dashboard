<script lang="ts">
    import { derived } from "svelte/store";
    import { datadescription, latestData } from "../../../routes/connected/ConnectionStores";

    export let props: any
    let isDummy: any = props.isDummy

    let id = props.valueId
    const description = derived(datadescription, (xs: any) => xs.filter((x :any) => x.id == id)[0])
    const latestValue = derived(latestData, (xs: any) => xs[id])

    let isError = false
    if ($description === undefined)
    {
        isError = true
    }
    isDummy = false
</script>

<div class="p-3">
    {#if isError}
        <p class="font-bold">ERROR: undefined</p>
        <div class="flex flex-row items-end space-x-1">
            <p class="text-4xl">-</p>
            <p class="text-stone-400 grow"></p>
        </div>
    {:else if !isDummy}
        <p class="font-bold">{$description.name}</p>
        <div class="flex flex-row items-end space-x-1">
            <p class="text-4xl">{($latestValue ?? 0).toFixed(2)}</p>
            <p class="text-stone-400 grow">{$description.unit}</p>
        </div>
    {:else}
    <div class="text-transparent">
        <p class="font-bold">dummy</p>
        <div class="flex flex-row items-end space-x-1">
            <p class="text-4xl">hi</p>
            <p class="grow">user</p>
        </div>
    </div>
    {/if}
</div>