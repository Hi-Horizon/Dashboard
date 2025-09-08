<script lang="ts">
    export let name = ""
    export let value: any
</script>

<input name={name} bind:value={value} class="rounded-sm bg-stone-700 w-full"/>