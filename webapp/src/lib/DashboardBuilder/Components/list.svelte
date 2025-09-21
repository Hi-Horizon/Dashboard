<script lang="ts">
import { parseComponentName } from "../ComponentParser";


export let elements: any[] = []
export let props: any = {}
</script>
<!-- still needed for status list -->
{#if elements.length > 0} 
<div class="rounded border-separate flex flex-col flex-1" >
    {#each elements as element, index}
        <div class="odd:bg-stone-700 even:bg-stone-800 last:rounded-b first:rounded-t grow flex flex-col justify-center">
            <svelte:component this={element.component} bind:props={element.props} />
        </div>
    {/each}
</div>
<!-- the good version -->
{:else}
<div class="rounded border-separate flex flex-col  flex-1" >
    {#each props.items as element, index}
        <div class="odd:bg-stone-700 even:bg-stone-800 last:rounded-b first:rounded-t flex flex-col justify-center">
            <svelte:component this={parseComponentName(element.componentName)} bind:props={element.props}/>
        </div>
    {/each}
</div>
{/if}