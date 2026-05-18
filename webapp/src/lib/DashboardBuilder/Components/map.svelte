<script lang="ts">
    import Cell from '../../Components/cell.svelte';
    import { onMount, onDestroy, tick } from 'svelte';
    import { datadescription, liveData } from "../../../routes/ConnectionStores";
    import { derived } from 'svelte/store';
    import { boatIconOptions } from '../../leaflet-maps/icons';

    export let props: any
    let latRef = props.lat
    let lngRef = props.lng

    const latValue = derived([liveData, datadescription], ([$liveData, $datadescription]) => {
        const latDescription = $datadescription.filter((x :any) => x.name == latRef)[0]  
        return $liveData[latDescription.id]
    })
    const lngValue = derived([liveData, datadescription], ([$liveData, $datadescription]) => {
        const lngDescription = $datadescription.filter((x :any) => x.name == lngRef)[0]  
        return $liveData[lngDescription.id]
    })

    let mapElement:any;
    let map:any;
    let boatMarker:any;

    let leaflet: any;

    onMount(async () => {
        await tick();
        leaflet = await import('leaflet');
        const boatIcon = leaflet.icon(boatIconOptions)

        map = leaflet.map(mapElement).setView([($lngValue ?? 0), ($latValue ?? 0)], 13);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        boatMarker = leaflet.marker([($lngValue ?? 0), ($latValue ?? 0)], {icon: boatIcon}).addTo(map)
            .bindPopup('Hi-horizon racing team')
            // .openPopup();

        setInterval(() => {
            if ($lngValue === undefined || $latValue === undefined) return
            boatMarker.setLatLng(leaflet.latLng($lngValue, $latValue))
        }, 1000);
    });

    onDestroy(async () => {
        if(map) {
            console.log('Unloading Leaflet map.');
            map.remove();
        }
    });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
     crossorigin="">
  </script>
</svelte:head>

<div class="flex-1 w-full">
    <Cell>
        <div class="font-bold pb-2">Position</div>
        <div bind:this={mapElement} class="flex-1 h-96 w-96"></div>
    </Cell>
</div>

