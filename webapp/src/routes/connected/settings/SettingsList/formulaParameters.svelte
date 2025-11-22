<!-- <script lang="ts">
    import EditableTable from "./editableTable.svelte";

    export let rows: any[]
    export let draftChanges: any[]

    const headers = ["name", "quantity", "unit", "default value", "is input"]
    let constructObject: any = {
        name: "",
        unit: "",
        quantity: "",
        defaultValue: "",
        isInput: ""
    }
</script>

<div>
    <p class="text-left font-bold text-lg">Formula Parameters</p>
    <EditableTable headers={headers} bind:draftChanges bind:rows bind:constructObject objectType="formulaParameter"/>
</div> -->