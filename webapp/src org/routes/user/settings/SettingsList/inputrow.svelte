<script lang="ts">
    import type { SettingsLocalChange, SettingsType } from "$lib/interfaces/SettingsLocalChange";
    import Button from "../../../../lib/Components/button.svelte";
    import Input from "../../../../lib/Components/input.svelte";

    export let draftChanges: any[]
    export let constructObject: any
    export let objectType: SettingsType

    const keys = Object.keys(constructObject).map(x => {return x as keyof any});

    let openCreation: boolean = false;

    function revealAddForm(): void {
        openCreation = true;
    }

    function closeAddForm(): void {
        openCreation = false;
        keys.forEach(key => {
            constructObject[key] = ""
        })
    }

    function addToDraftChanges() {
        let filledParams = keys.filter(key => {
            return constructObject[key] !== ""
        })
        if (filledParams.length === 0) {
            // TODO let user know which rows are not filled yet
            console.log("missed input")
            return;
        };

        let newLocalChange: SettingsLocalChange = {operation: "Add", settingType: objectType, structure: structuredClone(constructObject)};
        draftChanges = [...draftChanges, newLocalChange];
        
        closeAddForm();
    }
</script>

<tr>
    {#if openCreation}
        {#each keys as key}
            <td><Input bind:value={constructObject[key]}/></td>
        {/each}
        <td class="flex justify-evenly">
            <Button onclick={()=>addToDraftChanges()}>Add</Button>
            <Button onclick={()=>closeAddForm()}>Cancel</Button>
        </td>
    {:else}
        <td colspan=6>
            <button on:click={()=>revealAddForm()} class="text-center w-full hover:bg-stone-600 rounded flex justify-center py-1">
                <img src="../icons/addCircle.svg" alt="Add">
            </button>
        </td>
    {/if}
</tr>