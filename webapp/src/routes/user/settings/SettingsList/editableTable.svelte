<script lang="ts">
    import Table from "$lib/Components/table.svelte";
    import type { SettingsLocalChange, SettingsType } from "../../../../lib/interfaces/SettingsLocalChange";
    import Inputrow from "./inputrow.svelte";
    import Row from "./row.svelte";
    
    export let rows: any[]
    export let draftChanges: SettingsLocalChange[] = [];
    export let headers: string[] = []
    export let constructObject
    export let objectType: SettingsType

    function checkIfLocalNotDeleted(name:string): boolean {
        let found:boolean = true;
        draftChanges.forEach(change => {
            if (change.structure === name) {
                found=false;
            }
        });
        return found;
    }
</script>

<Table id={objectType} headers={headers}>
    {#each rows as row}
        {#if checkIfLocalNotDeleted(row.name) === true}
            <Row bind:changelog={draftChanges} bind:readStatistic={row} state="existing"></Row>
        {:else}
            <Row bind:changelog={draftChanges} bind:readStatistic={row} state="draftDelete"></Row>
        {/if}
    {/each}
    {#each draftChanges.filter(t => t.operation === "Add" && t.settingType === objectType) as toAdd}
        <Row bind:changelog={draftChanges} bind:readStatistic={toAdd.structure} state="new"></Row>
    {/each}
    <Inputrow bind:draftChanges constructObject={constructObject} objectType={objectType}/>
</Table>
