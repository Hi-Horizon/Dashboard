<script lang="ts">
    export let props: any
    let data: any = props.data
    let currentValue: any = props.currentValue
    let statusColor= props.statusColor
</script>

<div class="flex flex-row items-end justify-between p-2 {$statusColor}">
    <p class="pr-1">{data.name}:</p>
    <div class="flex">
        <p class="">{$currentValue}</p>
        <p class="grow">{data.unit}</p>
    </div>
</div>