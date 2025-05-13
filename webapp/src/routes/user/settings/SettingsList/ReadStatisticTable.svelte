<!-- <script lang="ts">
    import type { ReadStatisticType } from "$lib/interfaces/ReadStatisticType";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
    import Table from "../../../../lib/Components/table.svelte";
    import Inputrow from "./inputrow.svelte";
    import Row from "./row.svelte";

    export let readStatisticTypes: ReadStatisticType[] = [];
    export let readStatisticTypesLocalChangeLog: SettingsLocalChange[] = [];
    
    function checkIfLocalNotDeleted(name:string): boolean {
        let found:boolean = true;
        readStatisticTypesLocalChangeLog.forEach(change => {
            if (change.structure === name) {
                found=false;
            }
        });
        return found;
    }

    let constructObject: any = {
        name: "",
        abbreviation: "",
        quantity: "",
        unit: "",
        display: ""
    }

    let headers = ["name", "tag", "quantity", "unit", "display"]
</script>

<div>
    <p class="text-left font-bold text-lg">ReadStatistics types</p>
    <Table id="readstatistics" headers={headers}>
        {#each readStatisticTypes as readStatisticType}
            {#if checkIfLocalNotDeleted(readStatisticType.name) === true}
                <Row bind:changelog={readStatisticTypesLocalChangeLog} bind:readStatistic={readStatisticType} state="existing"></Row>
            {/if}
        {/each}
        {#each readStatisticTypesLocalChangeLog.filter(t => t.operation === "Add") as readStatisticType}
                <Row bind:changelog={readStatisticTypesLocalChangeLog} bind:readStatistic={readStatisticType.structure} state="new"></Row>
        {/each}
        <Inputrow bind:draftChanges={readStatisticTypesLocalChangeLog} constructObject={constructObject} objectType={"ReadStatisticType"}></Inputrow>
    </Table>
    <p class="text-left text-xs">note: deleting a type will also delete all the data associated to it, be careful!</p>
</div> -->
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