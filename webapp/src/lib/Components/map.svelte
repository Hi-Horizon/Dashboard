<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import Cell from './cell.svelte';

    export let elements: any[]
    let lng = elements[0]
    let lat = elements[1]

    let mapElement:any;
    let map:any;
    let boatMarker:any;

    let leaflet: any;

    onMount(async () => {
        await tick();
        leaflet = await import('leaflet');

        map = leaflet.map(mapElement).setView([$lng, $lat], 13);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        boatMarker = leaflet.marker([$lng, $lat]).addTo(map)
            .bindPopup('Hi-horizon racing team')
            .openPopup();

        setInterval(() => boatMarker.setLatLng(leaflet.latLng($lng, $lat)), 1000);
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
        <h2>Position</h2>
        <div bind:this={mapElement} class="flex-1 h-96 w-96"></div>
    </Cell>
</div>

