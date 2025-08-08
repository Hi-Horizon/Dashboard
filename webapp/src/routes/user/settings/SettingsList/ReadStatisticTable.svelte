<script lang="ts">
    import EditableTable from "./editableTable.svelte";

    export let rows: any[]
    export let draftChanges: any[]

    const headers = ["name", "tag", "quantity", "unit", "display"]
    let constructObject: any = {
        name: "",
        abbreviation: "",
        quantity: "",
        unit: "",
        display: ""
    }
</script>

<div>
    <p class="text-left font-bold text-lg">Data Descriptions</p>
    <EditableTable headers={headers} bind:draftChanges bind:rows bind:constructObject objectType="ReadStatisticType"/>
    <p class="text-left text-xs">note: deleting a type will also delete all the data associated to it, be careful!</p>
</div>