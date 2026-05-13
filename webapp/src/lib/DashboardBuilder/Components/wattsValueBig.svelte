<script lang="ts">
    import { derived } from "svelte/store";
    import { datadescription, liveData } from "../../../routes/ConnectionStores";

    export let props: any

    let isDummy: any = props.isDummy
    let valueName = props.valueName

    let nameVoltage             = props.voltageId
    console.log(nameVoltage)
    const descriptionVoltage    = derived(datadescription, (xs: any) => xs.filter((x :any) => x.name == nameVoltage)[0])
    console.log($descriptionVoltage)
    const latestVoltage         = derived(liveData, (xs: any) => xs[$descriptionVoltage.id])
    console.log($latestVoltage)

    let nameCurrent             = props.currentId
    const descriptionCurrent    = derived(datadescription, (xs: any) => xs.filter((x :any) => x.name == nameCurrent)[0])
    const latestCurrent         = derived(liveData, (xs: any) => xs[$descriptionCurrent.id])

    let isError = false
    if ($descriptionVoltage === undefined || $descriptionCurrent === undefined)
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
        <p class="font-bold">{valueName}</p>
        <div class="flex flex-row items-end space-x-1">
            <p class="text-4xl">{($latestVoltage*$latestCurrent || null)?.toFixed(2) ?? "-"}</p>
            <p class="dark:text-stone-400 grow"></p>
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