<script lang="ts">
    import Cell from "../../Components/cell.svelte";
import { parseComponentName } from "../ComponentParser";

export let props: any = {}
export let listName = props.name
</script>

<!-- {#if listName !== undefined} -->
<Cell>
    {#if listName !== undefined}<div class="font-bold pb-2">{listName}</div>{/if}
    <div class="rounded border-separate flex flex-col flex-1" >
        {#each props.items as element, index}
            <div class="odd:bg-stone-300 dark:odd:bg-stone-700 last:rounded-b first:rounded-t flex flex-col justify-center">
                <svelte:component this={parseComponentName(element.componentName)} bind:props={element.props}/>
            </div>
        {/each}
    </div>
</Cell>
<!-- {:else}
<Cell>
<div class="rounded border-separate flex flex-col flex-1 border-stone-700" >
    {#each props.items as element, index}
        <div class="dark:odd:bg-stone-700 dark:even:bg-stone-800 last:rounded-b first:rounded-t flex flex-col justify-center">
            <svelte:component this={parseComponentName(element.componentName)} bind:props={element.props}/>
        </div>
    {/each}
</div>
</Cell>
{/if} -->