<script lang="ts">
    import { derived } from "svelte/store";
    import { datadescription, liveData } from "../../../routes/ConnectionStores";

    export let props: any

    let isDummy: any = props.isDummy

    let name = props.valueId
    const description = derived(datadescription, (xs: any) => xs.filter((x :any) => x.name == name)[0])
    const latestValue = derived(liveData, (xs: any) => xs[$description.id])

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
            <p class="dark:text-stone-400 grow"></p>
        </div>
    {:else if !isDummy}
        <p class="">{$description.name}</p>
        <div class="flex flex-row items-end space-x-1">
            <p class="text-4xl">{($latestValue)?.toFixed(2) ?? "-"}</p>
            <p class="dark:text-stone-400 grow">{$description.unit}</p>
        </div>
    {:else}
    <div class="text-transparent">
        <p class="">dummy</p>
        <div class="flex flex-row items-end space-x-1">
            <p class="text-4xl">hi</p>
            <p class="grow">user</p>
        </div>
    </div>
    {/if}
</div>