<script lang="ts">
    import type { ReadStatisticType } from "$lib/interfaces/ReadStatisticType";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
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
</script>

<div>
    <p class="text-left font-bold text-lg">ReadStatistics types</p>
    <div class="p-5 bg-stone-800 rounded">
        <table class="w-full table-fixed">
        <thead class="text-left">
            <tr>
                <th>Name</th>
                <th>Abbreviation</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>display</th>
            </tr>
        </thead>
        <tbody>
            {#each readStatisticTypes as readStatisticType}
                {#if checkIfLocalNotDeleted(readStatisticType.name) === true}
                    <Row bind:changelog={readStatisticTypesLocalChangeLog} bind:readStatistic={readStatisticType} state="existing"></Row>
                {/if}
            {/each}
            {#each readStatisticTypesLocalChangeLog.filter(t => t.operation === "Add") as readStatisticType}
                    <Row bind:changelog={readStatisticTypesLocalChangeLog} bind:readStatistic={readStatisticType.structure} state="new"></Row>
            {/each}
            <Inputrow bind:changelog={readStatisticTypesLocalChangeLog}></Inputrow>
        </tbody>
        </table>
    </div>
    <p class="text-left text-xs">note: deleting a type will also delete all the data associated to it, be careful!</p>
</div>