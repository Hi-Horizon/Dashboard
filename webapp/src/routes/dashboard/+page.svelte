<script lang="ts">
import { pageName } from "../../stores";
import { setupPageDefault } from "$lib/setupPageDefault";
import { onMount } from "svelte";
import DashboardBuilder from "$lib/DashboardBuilder/Components/DashboardBuilder.svelte";
import { getlayoutConfig } from "$lib/DashboardBuilder/LayoutConfig";
import DashboardConfigUploader from "$lib/DashboardBuilder/Components/DashboardConfigUploader.svelte";
    import { fetchConnectionStores } from "$lib/fetchConnectionStores";
    import { canSchema, datadescription, liveData } from "../ConnectionStores";

setupPageDefault();
pageName.set("Dashboard");

let DashboardLayout:any;

//fetches connectionstores in case of when store memory is wiped 
onMount(async () => {
    await fetchConnectionStores(datadescription, canSchema, liveData);
})

async function fetchLayout() {
    DashboardLayout = await getlayoutConfig();
}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-3">
    <!-- top row -->
    {#await fetchLayout()}
        loading..
    {:then}
    
    <DashboardBuilder/>
    <DashboardConfigUploader />
    
    {/await}
    
</div>