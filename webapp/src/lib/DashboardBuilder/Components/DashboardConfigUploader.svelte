<!-- TODO: merge into builder -->
<script lang="ts">
    import Button from "../../Components/button.svelte";
    import Cell from "../../Components/cell.svelte";
    import Input from "../../Components/input.svelte";
    import { editLayoutconfig, getlayoutConfig } from "../LayoutConfig";
    import { layout } from "./layoutStore";

    let newConfigStr = ""

    //as of now only for main dashboard (id 1)
    async function updateConfig() {
        //parse and check if str is valid json
        try {
            JSON.parse(newConfigStr)
        } catch (error: any) {
            alert ("Error: String is not a valid JSON-object: \n" + error.message + "\n\n Please fix the error and try again.")
        }
            
        await editLayoutconfig(newConfigStr)
        layout.set(await getlayoutConfig())
        newConfigStr = ""

        alert("layout update succesful!")
    }
</script>

<Cell>
        <div class="font-semibold pb-1">Edit dashboard layout</div>
        <div class="flex space-x-4 justify-center-safe">
            <Input name="newConfig" bind:value={newConfigStr} placeholder={"[[\"componentName\":\"...\"]]"}/>
            <Button onclick={()=>updateConfig()}>Upload</Button>
        </div>
</Cell>