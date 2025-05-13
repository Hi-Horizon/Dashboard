<script lang="ts">
export let elements: any[]
</script>

<div class="rounded border-separate flex flex-col flex-1" >
    {#each elements as element, index}
        <div class="odd:bg-stone-700 even:bg-stone-800 last:rounded-b first:rounded-t flex-grow flex flex-col justify-center">
            <svelte:component this={element.component} bind:props={element.props} />
        </div>
    {/each}
</div>