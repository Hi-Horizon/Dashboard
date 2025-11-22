<script lang="ts">
    export let name = ""
    export let value: any
    export let placeholder = ""
</script>

<input name={name} type={"text"} placeholder={placeholder} bind:value={value} class="rounded-sm bg-stone-700 w-full" />