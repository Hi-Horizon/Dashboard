<script lang="ts">
    import ReadStatisticTable from "./SettingsList/ReadStatisticTable.svelte";
    import { pageName } from "../../stores";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
    import { setupPageDefault } from "$lib/setupPageDefault";
    import { parseOperationReadStatistic } from "$lib/settings/ReadStatistics";
    import { db } from "$lib/IOconnections/DBO/databaseObject";
    import { writable, type Writable } from "svelte/store";
    import CanMessageInfoImporter from "$lib/settings/CanMessageInfoImporter.svelte";
    import Button from "$lib/Components/button.svelte";

    setupPageDefault();
    pageName.set("Settings");

    let draftChanges: Writable<SettingsLocalChange[]> = writable([])

    let DataDescriptions: Writable<any[]> = writable([])

    async function fetchDataDescriptionFromDb() {
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

    let dark = false
	function toggleDarkMode() {
		setMode(!dark)
	}

	function setMode(value: boolean) {
		dark = value

		// update page styling
		if (dark) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}

		// store the theme as a local override
		localStorage.theme = dark ? 'dark' : 'light'

		// if the toggled-to theme matches the system defined theme, clear the local override
		// this effectively provides a way to override or revert to "automatic" setting mode
		if (window.matchMedia(`(prefers-color-scheme: ${localStorage.theme})`).matches) {
			localStorage.removeItem('theme')
		}
	}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>


<div class="flex flex-col grow space-y-5">
    <Button onclick={toggleDarkMode}>Toggle dark mode</Button>

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