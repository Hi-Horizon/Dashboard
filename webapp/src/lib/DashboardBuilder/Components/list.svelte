<script lang="ts">
    import Cell from "../../Components/cell.svelte";
import { parseComponentName } from "../ComponentParser";

export let props: any = {}
export let listName = props.name
</script>

{#if listName !== undefined}
<Cell>
    <div class="font-bold pb-3">{listName}</div>
    <div class="rounded border-separate flex flex-col flex-1" >
        {#each props.items as element, index}
            <div class="odd:bg-stone-700 even:bg-stone-800 last:rounded-b first:rounded-t flex flex-col justify-center">
                <svelte:component this={parseComponentName(element.componentName)} bind:props={element.props}/>
            </div>
        {/each}
    </div>
</Cell>
{:else}
<div class="rounded border-separate flex flex-col flex-1" >
    {#each props.items as element, index}
        <div class="odd:bg-stone-700 even:bg-stone-800 last:rounded-b first:rounded-t flex flex-col justify-center">
            <svelte:component this={parseComponentName(element.componentName)} bind:props={element.props}/>
        </div>
    {/each}
</div>
{/if}