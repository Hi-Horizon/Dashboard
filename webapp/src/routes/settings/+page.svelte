<script lang="ts">
    import { onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { getDb } from "$lib/IOconnections/DBO/databaseObject";

    import { pageName } from "../../stores";
    import { setupPageDefault } from "$lib/setupPageDefault";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";

    import ReadStatisticTable from "./SettingsList/ReadStatisticTable.svelte";
    import CanMessageInfoImporter from "$lib/settings/CanMessageInfoImporter.svelte";
    import { parseOperationReadStatistic } from "$lib/settings/ReadStatistics";

    setupPageDefault();
    pageName.set("Settings");

    let draftChanges: Writable<SettingsLocalChange[]> = writable([])

    let DataDescriptions: Writable<any[]> = writable([])

    onMount(async () => {
        await fetchDataDescriptionFromDb();
    })

    async function fetchDataDescriptionFromDb() {
        const db = await getDb();
        let rawData: any[] = await db.select('SELECT * FROM DataDescription')
        rawData.forEach((row) => {
            row.CANid = '0x' + row.CANid.toString(16);
        });
        DataDescriptions.set(rawData);
    }

    function askEmptyLocalChangeConfirmation() {
        let confirmation: boolean = confirm("Are you sure you want to undo all these changes?\nThis cannot be undone.");
        if (confirmation === true) emptyAllLocalChanges();
    }

    function emptyAllLocalChanges() {
        draftChanges.set([]);
    }

    let waitingToSubmit: boolean = false;
    async function submitChanges(): Promise<any> {
        const db = await getDb();
        // const AllchangeLogs: SettingsLocalChange[][] = [$draftChanges];
        let confirmation: boolean = confirm("are you sure you want these changes?");
        if (confirmation === true) {
            waitingToSubmit = true;
            $draftChanges.forEach(change => {
                parseOperationReadStatistic(db, change)
            });
            waitingToSubmit = false;
            emptyAllLocalChanges();
            await fetchDataDescriptionFromDb() // update screen
        }
    }
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="flex flex-col grow space-y-5">
    <div class="grow space-y-3">
        {#await fetchDataDescriptionFromDb()}
            <p>loading...</p>
        {:then}
            <CanMessageInfoImporter />
            <ReadStatisticTable bind:draftChanges bind:rows={DataDescriptions}/>
        {/await}
        <!-- <FormulaParameters  bind:draftChanges rows={[]}/> -->
    </div>

    <footer class="self-end">
        <button on:click={()=>askEmptyLocalChangeConfirmation()} class="p-2 text-center bg-stone-500 hover:bg-stone-400 rounded">Undo</button>
        {#if waitingToSubmit === true}
            <button class="p-2 text-center bg-green-600 rounded">loading...</button>
        {:else}
            <button on:click={()=>submitChanges()} class="p-2 text-center bg-green-700 hover:bg-green-600 rounded">
                Save all changes
            </button>
        {/if}
    </footer>
</div>