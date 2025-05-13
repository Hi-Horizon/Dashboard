<script lang="ts">
    import Cell from "./cell.svelte";

    export let id: string

    export let headers: string[]
</script>

<Cell>
    <table id={id} class="w-full table-fixed">
        <thead class="text-left">
            <tr>
            {#each headers as header}
                <th>{header}</th>
            {/each}
            </tr>
        </thead>
        <tbody>
            <slot />
        </tbody>
    </table>
</Cell>