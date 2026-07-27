<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { Map, CircleMarker, Marker, Polyline } from 'leaflet';
    import { datadescription, liveData } from "../../../routes/ConnectionStores";
    import { derived, writable, type Readable, type Writable } from 'svelte/store';
    import Cell from '../../Components/cell.svelte';
    import { boatIconOptions } from '../../leaflet-maps/icons';
    import Button from '$lib/Components/button.svelte';

    // --- Types ---
    interface GCSCoordinates {
        lat: number,
        lng: number
    }

    interface CartesianCoordinates {
        x: number,
        y: number
    }

    interface Coordinates {
        gcs: GCSCoordinates
        cartesian: CartesianCoordinates //when there is no route yet, boat should be able to not have coordinates yet
    }

    const espelLat = 52.7196
    const espelLng = 5.6453

    export let props: any
    let latRef = props.lat
    let lngRef = props.lng

    // reference coordinate to create a local cartesian system
    const refCoordinate: Writable<GCSCoordinates> = writable({lat:0 ,lng:0})

    function degreesMinutesToDecimalDegrees(rawValue: number) {
        const degrees = Math.floor(rawValue / 100)
        const minutes = rawValue - (degrees * 100)
        const minutesToDegrees = minutes / 60.0
        return degrees + minutesToDegrees
    }

    const boatPos: Readable<Coordinates> = derived([liveData, datadescription, refCoordinate], ([$liveData, $datadescription, $refCoordinate]) => {
        let lat: number;
        let lng: number;

        const latDescription = $datadescription.filter((x :any) => x.name == latRef)[0]
        if (Number.isFinite(degreesMinutesToDecimalDegrees($liveData[latDescription.id]))) {
            lat = degreesMinutesToDecimalDegrees($liveData[latDescription.id])
        } else {
            lat = espelLat
        }

        const lngDescription = $datadescription.filter((x :any) => x.name == lngRef)[0]
        if (Number.isFinite(degreesMinutesToDecimalDegrees($liveData[lngDescription.id]))) {
            lng = degreesMinutesToDecimalDegrees($liveData[lngDescription.id])
        } else {
            lng = espelLng
        }

        const gcs: GCSCoordinates = {lat, lng}
        const cartesian = toCartesian(gcs, $refCoordinate)
        return {gcs, cartesian}
    })

    let distanceToFinish = 0

    let mapElement:any;
    let map: Map | null = null;

    // --- State ---
    const routeInfo = JSON.parse(localStorage.routeMap || "{}")
    let waypoints: Coordinates[] = routeInfo.waypoints;
    waypoints ??= []
    let elements: RouteElement[] = routeInfo.elements;
    elements ??= []

    let dataLoaded = false;
    let outputText = '';
    let waypointMarkers: CircleMarker[] = [];
    let boatMarker: Marker | null = null;
    let routeLine: Polyline | null = null;

    let L: typeof import('leaflet') | null = null;

    onMount(async () => {
        //initialize leaflet, create map
        L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        const boatIcon = L.icon(boatIconOptions)

        map = L.map(mapElement).setView([($boatPos.gcs.lat), ($boatPos.gcs.lng)], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // set boat marker on current coördinates
        boatMarker = L.marker([($boatPos.gcs.lat), ($boatPos.gcs.lng)], {icon: boatIcon}).addTo(map)
            .bindPopup('Hi-horizon racing team')
            // .openPopup();
        
        //render a route if one is available
        if (waypoints.length != 0 || elements.length != 0) {
            dataLoaded = true
            renderRoute()
        }
    });

    $: {
        if (boatMarker === null || $boatPos.gcs.lng === undefined || $boatPos.gcs.lat === undefined) {}
        else {
            boatMarker.setLatLng(L.latLng($boatPos.gcs.lat, $boatPos.gcs.lng))
            handleCalculate()
        }
    }

    onDestroy(async () => {
        if(map) {
            console.log('Unloading Leaflet map.');
            map.remove();
        }
    });

    // --- Classes ---

    class RouteElement {
        p1: Coordinates;
        p2: Coordinates;
        dx: number;
        dy: number;
        length: number;
        A: number;
        B: number;
        C: number;

        constructor(p1: Coordinates, p2: Coordinates) {
            this.p1 = p1;
            this.p2 = p2;
            this.dx = p2.cartesian.x - p1.cartesian.x;
            this.dy = p2.cartesian.y - p1.cartesian.y;
            this.length = Math.hypot(this.dx, this.dy);
            this.A = this.dy;
            this.B = -this.dx;
            this.C = this.dx * p1.cartesian.y - this.dy * p1.cartesian.x;
        }
    }

  // --- Utility Functions ---

    function parseCSV(content: string): Coordinates[] {
        const lines = content.trim().split('\n');
        const dataLines = lines.slice(1);
        return dataLines.map(line => {
            const [lat, lng, x, y] = line.split(',').map(Number);
            return {gcs:{lat, lng}, cartesian:{x, y}};
        });
    }

    function distanceWPToEnd(elementIndex: number): number {
        let cumDistance = 0;
        for (let i = elementIndex; i < elements.length; i++) {
        cumDistance += elements[i].length;
        }
        return cumDistance;
    }

    function toCartesian(
        gcs: GCSCoordinates,
        referenceGcs: GCSCoordinates
    ): CartesianCoordinates {
        const R = 6371000; //earths radius in meters
        const φ = (gcs.lat * Math.PI) / 180;
        const λ = (gcs.lng * Math.PI) / 180;
        const φ0 = (referenceGcs.lat * Math.PI) / 180;
        const λ0 = (referenceGcs.lng * Math.PI) / 180;
        const x = R * (λ - λ0) * Math.cos(φ0);
        const y = R * (φ - φ0);
        return { x, y };
    }

    function distancePointToLine(x0: number, y0: number, element: RouteElement): number {
        const noemer = Math.hypot(element.A, element.B);
        if (noemer === 0) {
            return Math.hypot(x0 - element.p1.cartesian.x, y0 - element.p1.cartesian.y);
        }
        return Math.abs(element.A * x0 + element.B * y0 + element.C) / noemer;
    }

    function withinBounds(x0: number, y0: number, element: RouteElement): boolean {
        const abx = element.p2.cartesian.x - element.p1.cartesian.x;
        const aby = element.p2.cartesian.y - element.p1.cartesian.y;
        const a0x = x0 - element.p1.cartesian.x;
        const a0y = y0 - element.p1.cartesian.y;
        const dotABAB = abx * abx + aby * aby;
        const dotABA0 = a0x * abx + a0y * aby;
        if (dotABAB === 0) return false;
        const t = dotABA0 / dotABAB;
        return t >= 0 && t <= 1;
    }

    // --- Event Handlers ---

    // when a the route file in the input has changed
    function handleFileChange(event: Event): void {
        //get file, do nothing if file does not exist
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            //read content, if it is not a string, exit function
            const content = e.target?.result;
            if (typeof content !== 'string') return; //todo, alert if this is not the case

            // extract waypoints
            outputText = content;
            waypoints = parseCSV(content);
            refCoordinate.set({lat: waypoints[0].gcs.lat, lng: waypoints[0].gcs.lng});

            // Create array of edges between waypoints
            elements = [];
            for (let i = 0; i < waypoints.length - 1; i++) {
                elements.push(new RouteElement(waypoints[i], waypoints[i + 1]));
            }

            renderRoute();
            dataLoaded = true;
            localStorage.setItem("routeMap", JSON.stringify({waypoints, elements}))
        };
        reader.readAsText(file);
        
    }

    function renderRoute() {
        // Remove previously existing waypoint markers on map
        waypointMarkers.forEach(m => map?.removeLayer(m));
        waypointMarkers = [];

        // draw new waypoint markers on map
        for (let i = 0; i < waypoints.length; i++) {
            const wp = waypoints[i];
            const marker = L.circleMarker([wp.gcs.lat, wp.gcs.lng], { radius: 5 }).addTo(map);
            marker.bindPopup(`Waypoint ${i}`);
            waypointMarkers.push(marker);
        }

        handleCalculate();
    }

    function unrenderRoute() {
        // Remove previously existing waypoint markers on map
        waypointMarkers.forEach(m => map?.removeLayer(m));
        waypointMarkers = [];

        if (routeLine) map.removeLayer(routeLine);
    }

    //handeled alle berekening, deels kan in handlefilechange, deels kan in reactive statement
    function handleCalculate(): void {
        // check if everything is loaded in
        if (!dataLoaded || !L || !map) {
            console.log('Nog geen route amice');
            return;
        }

        // calculate the distance between the boat and every waypoint
        const pointDistances: number[] = waypoints.map(wp =>
            Math.hypot($boatPos.cartesian.x - wp.cartesian.x, $boatPos.cartesian.y - wp.cartesian.y)
        );

        let minDistance = Math.min(...pointDistances);
        let minInd = pointDistances.indexOf(minDistance);
        let pointFlag = true;

        for (let i = 0; i < elements.length; i++) {
            const lineDistance = distancePointToLine($boatPos.cartesian.x, $boatPos.cartesian.y, elements[i]);
            if (lineDistance < minDistance && withinBounds($boatPos.cartesian.x, $boatPos.cartesian.y, elements[i])) {
                minDistance = lineDistance;
                minInd = i;
                pointFlag = false;
            }
        }

        let nextWaypoint = minInd + 1;
        if (nextWaypoint >= waypoints.length) {
            nextWaypoint = waypoints.length - 1;
        }

        const distanceToNextWaypoint = Math.hypot(
            $boatPos.cartesian.x - waypoints[nextWaypoint].cartesian.x,
            $boatPos.cartesian.y - waypoints[nextWaypoint].cartesian.y
        );

        distanceToFinish = distanceWPToEnd(nextWaypoint) + distanceToNextWaypoint;

        // update the whole map and poly lines
        if (routeLine) map.removeLayer(routeLine);

        const routeCoords: [number, number][] = [[$boatPos.gcs.lat, $boatPos.gcs.lng]];
        for (let i = nextWaypoint; i < waypoints.length; i++) {
            routeCoords.push([waypoints[i].gcs.lat, waypoints[i].gcs.lng]);
        }

        routeLine = L.polyline(routeCoords, { weight: 4 }).addTo(map);
        map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
    }

    function resetRoute() {
        localStorage.removeItem("routeMap")
        elements = []
        waypoints = []
        unrenderRoute()
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
    <div class="font-bold pb-2">Navigation</div>
    <div bind:this={mapElement} class="flex-1 h-96 w-96"></div>
    <div class="pt-2">
        <input type="file" accept=".csv" on:change={handleFileChange} class="border-2 border-stone-300 hover:file:bg-stone-400 dark:border-stone-700 file:bg-stone-300 hover:border-stone-400 dark:file:bg-stone-700 dark:hover:file:bg-stone-600 dark:hover:border-stone-600 file:px-2  rounded "/>
    </div>
    <div>
        <Button onclick={resetRoute}>Reset Route</Button>
    </div>
    {#if dataLoaded}
    <div>Distance to finish: {(distanceToFinish/1000).toFixed(1)} km</div>
    {/if}
</Cell>