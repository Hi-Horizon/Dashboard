<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { parseComponentName } from "../ComponentParser";
    import { getlayoutConfig } from "../LayoutConfig";
    import { layout } from "./layoutStore";

    // TODO: make this work, Selects which dashboard to render
    export const layoutId = 1;
    
    let defaultStatusColor:Writable<string> = writable("");
    
    async function loadLayoutConfig() {
        layout.set(await getlayoutConfig())

        // error handling for the grid format of the config
        if (!($layout instanceof Array)) alert("warning: layout config has no rows defined in its grid")
        if ($layout.filter((x) => !(x instanceof Array)).length > 0) alert("warning: rows defined wrong in layout config")
    }
</script>

{#snippet failed()}
  <p>rendering failed, make the layout config adhere the format</p>
{/snippet}

{#await loadLayoutConfig()}
    <div>Loading layout...</div>
{:then} 
    <!-- <svelte:boundary {failed}> -->
    {#key $layout}
        {#each $layout as row}
        <div class="flex space-x-3">
            {#each row as cell}
                <svelte:component this={parseComponentName(cell.componentName)} bind:props={cell.props}/>
            {/each}
        </div>
        {/each}
    {/key}
    <!-- </svelte:boundary> -->
{/await}
