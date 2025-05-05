<script lang="ts">
    import Button from "../../../lib/Components/button.svelte";

let inputLink: string = "";
let link: string = "";

function changeLink() {
    link = inputLink;
}
</script>

<div class="rounded bg-stone-800 p-3">
    <!-- Current/Most recent race: -->
    <div class="rounded bg-stone-900">
        <iframe title="estela tracker" width="560" height="315" src={link} frameborder="0" allowfullscreen>track the race by filling in a link down below</iframe>
    </div>
    <div class="flex pt-3 space-x-1">
        <input type="text" bind:value={inputLink} placeholder="https://estela.co/..." class="rounded bg-stone-700 px-2 flex-1 placeholder:italic">
        <Button props={{onclick:changeLink}}>Watch</Button>
    </div>
</div>