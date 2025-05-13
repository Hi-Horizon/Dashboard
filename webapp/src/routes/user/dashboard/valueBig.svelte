<script lang="ts">
    export let props: any
    let data: any = props.data
    let currentValue: any = props.currentValue
    let isDummy: any = props.isDummy
</script>

<div class="p-3">
    {#if !isDummy}
    <p class="font-bold">{data.name}</p>
    <div class="flex flex-row items-end space-x-1">
        <p class="text-4xl">{$currentValue.toFixed(2)}</p>
        <p class="text-stone-400 flex-grow">{data.unit}</p>
    </div>
    {:else}
    <div class="text-white text-opacity-0">
        <p class="font-bold">dummy</p>
        <div class="flex flex-row items-end space-x-1">
            <p class="text-4xl">hi</p>
            <p class="flex-grow">user</p>
        </div>
    </div>
    {/if}
</div>