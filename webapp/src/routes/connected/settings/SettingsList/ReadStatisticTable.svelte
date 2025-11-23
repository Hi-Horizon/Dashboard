<script lang="ts">
    import type { Writable } from "svelte/store";
    import EditableTable from "./editableTable.svelte";

    export let rows: Writable<any[]>
    export let draftChanges: Writable<any[]>

    const headers = ["Name", "Tag", "Unit", "Quantity", "Display", "CANid", "Position", "Byte Length", "Scale", "Endian"]
    let constructObject: any = {
        name: "",
        abbreviation: "",
        unit: "",
        quantity: "", 
        display: "",
        canid: ""
    }
</script>

<div>
    <p class="text-left font-bold text-lg">Data Descriptions</p>
    <EditableTable headers={headers} bind:draftChanges bind:rows bind:constructObject objectType="ReadStatisticType"/>
    <p class="text-left text-xs">note: deleting a type will also delete all the data associated to it, be careful!</p>
</div>