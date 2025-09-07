<script lang="ts">
    import ReadStatisticTable from "./SettingsList/ReadStatisticTable.svelte";
    import { pageName } from "../../../stores";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
    import { setupPageDefault } from "$lib/setupPageDefault";
    import FormulaParameters from "./SettingsList/formulaParameters.svelte";
    import Database from "@tauri-apps/plugin-sql";
    import { parseOperationReadStatistic } from "../../../lib/settings/ReadStatistics";

    setupPageDefault();
    pageName.set("Settings");

    let draftChanges: SettingsLocalChange[]

    let DataDescriptions: any[] = []
    let readStatisticTypesLocalChangeLog: SettingsLocalChange[] = [];

    async function fetchDataDescriptionFromDb() {
        const db = await Database.load('sqlite:HiHorizonTelemetry.db');
        DataDescriptions = await db.select('SELECT * FROM DataDescription');
    }

    function askEmptyLocalChangeConfirmation() {
        let confirmation: boolean = confirm("Are you sure you want to undo all these changes?\nThis cannot be undone.");
        if (confirmation === true) emptyAllLocalChanges();
    }

    function emptyAllLocalChanges() {
        draftChanges = [];
        // data.readStatisticTypes = data.readStatisticTypes;
    }

    let waitingToSubmit: boolean = false;
    async function submitChanges(): Promise<any> {
        const db = await Database.load('sqlite:HiHorizonTelemetry.db');
        const AllchangeLogs: SettingsLocalChange[][] = [draftChanges];
        let confirmation: boolean = confirm("are you sure you want these changes?");
        if (confirmation === true) {
            waitingToSubmit = true;
            draftChanges.forEach(change => {
                parseOperationReadStatistic(db, change)
            });
            waitingToSubmit = false;
            // alert(result.response + "\ncode: "+ result.status);
            emptyAllLocalChanges();
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
            <ReadStatisticTable bind:draftChanges rows={DataDescriptions}/>
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