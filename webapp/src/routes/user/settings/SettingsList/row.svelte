<script lang="ts">
    import type { ReadStatisticType } from "$lib/interfaces/ReadStatisticType";
    import type { SettingsLocalChange } from "$lib/interfaces/SettingsLocalChange";

    export let readStatistic: ReadStatisticType
    export let state: String
    export let changelog: any[]
    const keys = Object.keys(readStatistic).map(x => {return x as keyof ReadStatisticType});

    export function deleteRow(name: string, isServerRow: boolean): void {
        if (isServerRow === false) {
            changelog = changelog.filter(t => t.structure.name != name);
        }
        else {
            let newLocalChange: SettingsLocalChange = {operation: "Delete", settingType: "ReadStatisticType", structure: name};
            changelog = [...changelog, newLocalChange];
            readStatistic = readStatistic;
        }
        console.log(changelog);
    }
</script>

<tr class="odd:bg-stone-700" id={readStatistic.name + "ReadStatisticRow"}>
    {#each keys as key}
        <td class="py-2">{readStatistic[key]}</td>
    {/each}
    {#if state === "existing"}
        <td class="py-2 flex justify-center">
            <button on:click={()=>deleteRow(readStatistic.name, true)} class="rounded bg-red-600 hover:bg-red-500 flex justify-center">
                <img src="../icons/trashcan.svg" alt="Delete">
            </button>
        </td>
    {/if}
    {#if state === "new"}
        <td class="py-2 flex justify-center">
            <button on:click={()=>deleteRow(readStatistic.name, false)} class="p-2 rounded bg-red-600 hover:bg-red-500 flex justify-center">
                undo
            </button>
        </td>
    {/if}
</tr>