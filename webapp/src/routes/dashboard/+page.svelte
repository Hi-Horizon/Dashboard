<script lang="ts">
import { onMount } from "svelte";

import { pageName } from "../../stores";
import { setupPageDefault } from "$lib/setupPageDefault";
import DashboardBuilder from "$lib/DashboardBuilder/Components/DashboardBuilder.svelte";
import DashboardConfigUploader from "$lib/DashboardBuilder/Components/DashboardConfigUploader.svelte";
import { canSchema, datadescription, liveData } from "../ConnectionStores";
import { fetchConnectionStores } from "$lib/fetchConnectionStores";

import { getlayoutConfig } from "$lib/DashboardBuilder/LayoutConfig";

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