<script lang="ts">
import { pageName } from "../../stores";
import { setupPageDefault } from "$lib/setupPageDefault";
import { onDestroy, onMount } from "svelte";
import DashboardBuilder from "$lib/DashboardBuilder/Components/DashboardBuilder.svelte";
import { getlayoutConfig } from "$lib/DashboardBuilder/LayoutConfig";
import DashboardConfigUploader from "$lib/DashboardBuilder/Components/DashboardConfigUploader.svelte";

setupPageDefault();
pageName.set("Dashboard");

let DashboardLayout:any;

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