<script lang="ts">
	import { onMount } from 'svelte';
    import Cell from '$lib/Components/cell.svelte';
    import Button from '$lib/Components/button.svelte';
    import { setupPageDefault } from '$lib/setupPageDefault';
    import { pageName } from '../../stores';

    setupPageDefault();
    pageName.set("Navigation generator");

	let L: any;
	let map: any;
	let polyline: any;

	let waypoints: {
		id: number;
		lat: number;
		lng: number;
	}[] = [];

	let markers: any[] = [];
	let nextId = 1;
	let totalDistance = 0;

	let mapContainer: HTMLDivElement;

	onMount(async () => {
		L = await import('leaflet');

		map = L.map(mapContainer).setView([53.0, 5.8], 13);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; OpenStreetMap'
		}).addTo(map);

		polyline = L.polyline([], { color: 'blue' }).addTo(map);

		map.on('click', (e: any) => {
			addWaypoint(e.latlng);
		});
	});

	function addWaypoint(latlng: any) {
		const wp = {
			id: nextId++,
			lat: latlng.lat,
			lng: latlng.lng
		};

		waypoints = [...waypoints, wp];

		const marker = L.marker(latlng, { draggable: true })
			.addTo(map)
			.on('drag', (e: any) => {
				updateWaypoint(wp.id, e.target.getLatLng());
			});

		markers.push(marker);

		updatePolyline();
		updateDistance();
	}

	function updateWaypoint(id: number, latlng: any) {
		waypoints = waypoints.map(w =>
			w.id === id ? { ...w, lat: latlng.lat, lng: latlng.lng } : w
		);

		updatePolyline();
		updateDistance();
	}

	function removeWaypoint(id: number) {
		const index = waypoints.findIndex(w => w.id === id);
		if (index === -1) return;

		map.removeLayer(markers[index]);
		markers.splice(index, 1);

		waypoints = waypoints.filter(w => w.id !== id);

		updatePolyline();
		updateDistance();
	}

	function moveWaypoint(index: number, direction: number) {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= waypoints.length) return;

		const newWaypoints = [...waypoints];
		[newWaypoints[index], newWaypoints[newIndex]] =
			[newWaypoints[newIndex], newWaypoints[index]];

		const newMarkers = [...markers];
		[newMarkers[index], newMarkers[newIndex]] =
			[newMarkers[newIndex], newMarkers[index]];

		waypoints = newWaypoints;
		markers = newMarkers;

		updatePolyline();
		updateDistance();
	}

	function updatePolyline() {
		const coords = waypoints.map(w => [w.lat, w.lng]);
		polyline.setLatLngs(coords);
	}

	function toCartesian(lat: number, lng: number, refLat: number, refLng: number) {
		const R = 6371000;
		const φ = lat * Math.PI / 180;
		const λ = lng * Math.PI / 180;
		const φ0 = refLat * Math.PI / 180;
		const λ0 = refLng * Math.PI / 180;

		return {
			x: R * (λ - λ0) * Math.cos(φ0),
			y: R * (φ - φ0)
		};
	}

	function updateDistance() {
		if (waypoints.length < 2) {
			totalDistance = 0;
			return;
		}

		const ref = waypoints[0];
		let total = 0;

		for (let i = 1; i < waypoints.length; i++) {
			const prev = toCartesian(
				waypoints[i - 1].lat,
				waypoints[i - 1].lng,
				ref.lat,
				ref.lng
			);

			const curr = toCartesian(
				waypoints[i].lat,
				waypoints[i].lng,
				ref.lat,
				ref.lng
			);

			const dx = curr.x - prev.x;
			const dy = curr.y - prev.y;

			total += Math.sqrt(dx * dx + dy * dy);
		}

		totalDistance = total;
	}

	let fileName = ""
	function exportCSV() {
		if (fileName === "") {
			alert("please select a name for the route")
			return 
		}
		if (waypoints.length === 0) {
			alert("please select at least 1 waypoint")
			return;
		}
		const ref = waypoints[0];
		let csv = "lat,lng,x_m,y_m\n";

		waypoints.forEach(wp => {
			const cart = toCartesian(wp.lat, wp.lng, ref.lat, ref.lng);
			csv += `${wp.lat},${wp.lng},${cart.x},${cart.y}\n`;
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = fileName + ".csv";
		a.click();

		URL.revokeObjectURL(url);
        alert("route has been saved!")
	}
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

<Cell>
    <div class="flex">
        <div bind:this={mapContainer} class="flex-1 h-150 w-200"></div>
        <div class="pl-3 space-y-2">
			<h3 class="font-bold text-xl">Waypoints</h3>
			<ul class="space-y-2">
				{#if waypoints.length != 0}
					{#each waypoints as wp, index}
						<li>
							#{index + 1}
							({wp.lat.toFixed(4)}, {wp.lng.toFixed(4)})
							<button on:click={() => moveWaypoint(index, -1)}>↑</button>
							<button on:click={() => moveWaypoint(index, 1)}>↓</button>
							<button on:click={() => removeWaypoint(wp.id)} class="bg-stone-700 hover:bg-stone-600 rounded px-3">Remove</button>
						</li>
					{/each}
				{:else}
						<div class="text-stone-500 italic">No waypoints added yet</div>
				{/if}
			</ul>

			<div class="pt-3 border-t border-white">
				Total Distance: {totalDistance.toFixed(0)} m
			</div>
			<label for=routeFileName class="pt-5 font-bold">Route name:</label>
			<input id="fileNameInput" bind:value={fileName} class="bg-stone-200 text-stone-900 rounded px-2 ml-2 placeholder:italic" placeholder="mijn_route" name="routeFileName">
			<button on:click={exportCSV} class="bg-green-700 hover:bg-green-600 rounded px-3 py-1 flex justify-center">
				Export to CSV
			</button>
		</div>
    </div>
</Cell>
