<script lang="ts">
    import Cell from "./cell.svelte";

    export let id: string

    export let headers: string[]
</script>

<Cell>
    <table id={id} class="w-full table-fixed">
        <thead class="text-left border-b-1">
            <tr>
            {#each headers as header}
                <th class="pl-2 py-3">{String(header).charAt(0).toUpperCase() + String(header).slice(1)}</th>
            {/each}
            </tr>
        </thead>
        <tbody>
            <slot />
        </tbody>
    </table>
</Cell>