<script lang="ts">
    import { pageName, showBackButton } from "../stores";
    import { derived, writable } from "svelte/store";
    import "../app.css";
    import { MQTTconnected } from "./ConnectionStores";
    import DashboardIcon from "$lib/Components/icons/dashboardIcon.svelte";
    import GraphIcon from "$lib/Components/icons/graphIcon.svelte";
    import NewRouteIcon from "$lib/Components/icons/newRouteIcon.svelte";
    import ConnectionIcon from "$lib/Components/icons/connectionIcon.svelte";
    import SettingsIcon from "$lib/Components/icons/settingsIcon.svelte";
    
    let { children } = $props();

    let currentPageName: string = $state("Page");
    pageName.subscribe((value) => {
        currentPageName = value;
    });


    const connectionColor = derived(MQTTconnected, (conn) => {
        if (conn) return "bg-teal-500"
        else return "bg-red-400"
    }) 
</script>

<div class="flex">
    <ul class="sticky top-0 shrink-0 flex flex-col p-2 w-16 h-screen bg-stone-200 dark:bg-stone-800 text-center space-y-3">
        <li class=""><a href="./dashboard"><DashboardIcon/></a></li>
        <li class="flex-1"><a href="./analyzation"><GraphIcon/></a></li>
        <li class="justify-self-end"><a href="./navigation-generator"><NewRouteIcon/></a></li>
        <li class="justify-self-end relative"><a href="./connection">
            <ConnectionIcon/>
            <span class="{$connectionColor} absolute top-0 end-0 size-3 rounded-full transform-translate-y-1/2 translate-x-1/2"></span>
        </a></li>
        <li class="justify-self-end"><a href="./settings"><SettingsIcon/></a></li>
    </ul>

    <div class="grow p-5 flex flex-col">
        <div class="flex pb-5 justify-center">
            {#if $showBackButton === true}
            <a href="../" onclick={()=>showBackButton.set(false)} class="hover:bg-stone-600 rounded text-center p-3 justify-self-start"><img src="/icons/arrowBack.svg" alt="Go Back"></a>
            {/if}
            <h1 class="font-bold text-2xl self-center justify-self-center grow">{currentPageName}</h1>
        </div>
        {@render children()}
    </div>
</div>