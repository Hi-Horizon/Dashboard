<script lang="ts">
    import type { ReadStatisticType } from "$lib/interfaces/ReadStatisticType";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";

    let wantsToAdd: boolean = false;
    let toAdd: ReadStatisticType = {
        name: "",
        abbreviation: "",
        quantity: "",
        unit: "",
        display: 1
    }
    export let changelog: any[]

    function revealAddForm(): void {
        wantsToAdd = true;
    }

    function closeAddForm(): void {
        wantsToAdd = false;
        toAdd.name="";
        toAdd.abbreviation="";
        toAdd.quantity="";
        toAdd.unit="";
    }

    function addReadStatisticType() {
        if (toAdd.name === "" || toAdd.abbreviation == "" || toAdd.quantity == "" || toAdd.unit == "") return;
        let newLocalChange: SettingsLocalChange = {operation: "Add", settingType: "ReadStatisticType", structure: structuredClone(toAdd)};
        changelog = [...changelog, newLocalChange];
        
        closeAddForm();
    }
</script>


<tr>
    {#if wantsToAdd}
        <td><input bind:value={toAdd.name} id="addName" class="rounded-sm bg-stone-700 w-full"/></td>
        <td><input bind:value={toAdd.abbreviation} id="addAbbreviation" class="rounded-sm bg-stone-700 w-full"/></td>
        <td><input bind:value={toAdd.quantity} id="addQuantity" class="rounded-sm bg-stone-700 w-full"/></td>
        <td><input bind:value={toAdd.unit} id="addUnit" class="rounded-sm bg-stone-700 w-full"/></td>
        <td><input bind:value={toAdd.display} id="addDisplay" class="rounded-sm bg-stone-700 w-full"/></td>
    {/if}
    {#if wantsToAdd}
        <td class="flex justify-evenly">
            <button on:click={()=>addReadStatisticType()} class="text-center">Add</button>
            <button on:click={()=>closeAddForm()} class="text-center">Cancel</button>
        </td>
    {:else}
        <td colspan=6>
            <button on:click={()=>revealAddForm()} class="text-center w-full hover:bg-stone-600 rounded flex justify-center py-1">
                <img src="../icons/addCircle.svg" alt="Add">
            </button>
        </td>
    {/if}
</tr>