<script lang="ts">
    import ReadStatisticTable from "./SettingsList/ReadStatisticTable.svelte";
    import { pageName } from "../../../stores";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";
    import { setupPageDefault } from "$lib/setupPageDefault";
    import { io } from "socket.io-client";
    import FormulaParameters from "./SettingsList/formulaParameters.svelte";

    export let data;
    setupPageDefault();
    pageName.set("Settings");

    const socket = io();

    socket.on('settingsUpdate', async (message) => {
        const response = await fetch('/user/settings/REST', {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}});
        const result = await response.json();
        data.readStatisticTypes = result.response.readStatisticTypes
    });

    let draftChanges: SettingsLocalChange[]

    let readStatisticTypesLocalChangeLog: SettingsLocalChange[] = [];

    function askEmptyLocalChangeConfirmation() {
        let confirmation: boolean = confirm("Are you sure you want to undo all these changes?\nThis cannot be undone.");
        if (confirmation === true) emptyAllLocalChanges();
    }

    function emptyAllLocalChanges() {
        draftChanges = [];
        data.readStatisticTypes = data.readStatisticTypes;
    }

    let waitingToSubmit: boolean = false;
    async function submitChanges(): Promise<any> {
        const AllchangeLogs: SettingsLocalChange[][] = [draftChanges];
        let confirmation: boolean = confirm("are you sure you want these changes?");
        if (confirmation === true) {
            waitingToSubmit = true;
            const response = await fetch('/user/settings/REST', {
						method: 'POST',
						body: JSON.stringify( AllchangeLogs ),
						headers: {
							'Content-Type': 'application/json'
						}});
            const result = await response.json();
            waitingToSubmit = false;
            alert(result.response + "\ncode: "+ result.status);
            socket.emit("settingsUpdate", "hai");
            emptyAllLocalChanges();
        }
    }
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="flex flex-col grow space-y-5">
    <div class="grow space-y-3">
        <ReadStatisticTable bind:draftChanges rows={data.readStatisticTypes}/>
        <FormulaParameters  bind:draftChanges rows={[]}/>
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