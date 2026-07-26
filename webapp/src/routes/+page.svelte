<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { canSchema, datadescription, liveData } from "./ConnectionStores";
    import { fetchConnectionStores } from "$lib/fetchConnectionStores";

    //fetch initial values for canSchema and DataDescription
    onMount(async () => {
        await fetchConnectionStores(datadescription, canSchema, liveData);
        await goto("./dashboard")
    })
</script>