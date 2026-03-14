<script lang="ts">
  import { onMount } from 'svelte';
  import type { Map, CircleMarker, Marker, Polyline } from 'leaflet';

  // --- Types ---
  interface Waypoint {
    lat: number;
    lng: number;
    x: number;
    y: number;
  }

  interface RefCoordinate {
    lat: number;
    lon: number;
  }

  interface Boot {
    lat: number;
    lng: number;
    x: number;
    y: number;
  }

  interface CartesianResult {
    x: number;
    y: number;
  }

  // --- State ---
  let waypoints: Waypoint[] = [];
  let elements: RouteElement[] = [];
  let refCoordinate: RefCoordinate | null = null;
  let dataLoaded = false;
  let outputText = '';

  let mapInstance: Map | null = null;
  let waypointMarkers: CircleMarker[] = [];
  let boatMarker: Marker | null = null;
  let routeLine: Polyline | null = null;

  let L: typeof import('leaflet') | null = null;

  onMount(async () => {
    L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
  });

  // --- Classes ---

  class RouteElement {
    p1: Waypoint;
    p2: Waypoint;
    dx: number;
    dy: number;
    length: number;
    A: number;
    B: number;
    C: number;

    constructor(p1: Waypoint, p2: Waypoint) {
      this.p1 = p1;
      this.p2 = p2;
      this.dx = p2.x - p1.x;
      this.dy = p2.y - p1.y;
      this.length = Math.hypot(this.dx, this.dy);
      this.A = this.dy;
      this.B = -this.dx;
      this.C = this.dx * p1.y - this.dy * p1.x;
    }
  }

  // --- Utility Functions ---

  function parseCSV(content: string): Waypoint[] {
    const lines = content.trim().split('\n');
    const dataLines = lines.slice(1);
    return dataLines.map(line => {
      const [lat, lng, x, y] = line.split(',').map(Number);
      return { lat, lng, x, y };
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
    lat: number,
    lng: number,
    refLat: number,
    refLng: number
  ): CartesianResult {
    const R = 6371000;
    const φ = (lat * Math.PI) / 180;
    const λ = (lng * Math.PI) / 180;
    const φ0 = (refLat * Math.PI) / 180;
    const λ0 = (refLng * Math.PI) / 180;
    const x = R * (λ - λ0) * Math.cos(φ0);
    const y = R * (φ - φ0);
    return { x, y };
  }

  function distancePointToLine(x0: number, y0: number, element: RouteElement): number {
    const noemer = Math.hypot(element.A, element.B);
    if (noemer === 0) {
      return Math.hypot(x0 - element.p1.x, y0 - element.p1.y);
    }
    return Math.abs(element.A * x0 + element.B * y0 + element.C) / noemer;
  }

  function withinBounds(x0: number, y0: number, element: RouteElement): boolean {
    const abx = element.p2.x - element.p1.x;
    const aby = element.p2.y - element.p1.y;
    const a0x = x0 - element.p1.x;
    const a0y = y0 - element.p1.y;
    const dotABAB = abx * abx + aby * aby;
    const dotABA0 = a0x * abx + a0y * aby;
    if (dotABAB === 0) return false;
    const t = dotABA0 / dotABAB;
    return t >= 0 && t <= 1;
  }

  // --- Event Handlers ---

  function handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      if (typeof content !== 'string') return;

      outputText = content;
      waypoints = parseCSV(content);
      refCoordinate = { lat: waypoints[0].lat, lon: waypoints[0].lng };

      elements = [];
      for (let i = 0; i < waypoints.length - 1; i++) {
        elements.push(new RouteElement(waypoints[i], waypoints[i + 1]));
      }

      dataLoaded = true;

      if (!L) return;

      if (!mapInstance) {
        mapInstance = L.map('map').setView([waypoints[0].lat, waypoints[0].lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);
      }

      waypointMarkers.forEach(m => mapInstance?.removeLayer(m));
      waypointMarkers = [];

      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i];
        const marker = L.circleMarker([wp.lat, wp.lng], { radius: 5 }).addTo(mapInstance);
        marker.bindPopup(`Waypoint ${i}`);
        waypointMarkers.push(marker);
      }
    };

    reader.readAsText(file);
  }

  function handleCalculate(): void {
    if (!dataLoaded || !L || !mapInstance || !refCoordinate) {
      console.log('Nog geen route amice');
      return;
    }

    const cart = toCartesian(53.0, 5.8, refCoordinate.lat, refCoordinate.lon);
    const boot: Boot = { lat: 53.0, lng: 5.8, ...cart };

    const pointDistances: number[] = waypoints.map(wp =>
      Math.hypot(boot.x - wp.x, boot.y - wp.y)
    );

    let minDistance = Math.min(...pointDistances);
    let minInd = pointDistances.indexOf(minDistance);
    let pointFlag = true;

    for (let i = 0; i < elements.length; i++) {
      const lineDistance = distancePointToLine(boot.x, boot.y, elements[i]);
      if (lineDistance < minDistance && withinBounds(boot.x, boot.y, elements[i])) {
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
      boot.x - waypoints[nextWaypoint].x,
      boot.y - waypoints[nextWaypoint].y
    );
    const distanceToFinish = distanceWPToEnd(nextWaypoint) + distanceToNextWaypoint;
    console.log('Distance to finish:', distanceToFinish);

    if (boatMarker) mapInstance.removeLayer(boatMarker);
    boatMarker = L.marker([boot.lat, boot.lng]).addTo(mapInstance);
    boatMarker.bindPopup('Boat position');

    if (routeLine) mapInstance.removeLayer(routeLine);

    const routeCoords: [number, number][] = [[boot.lat, boot.lng]];
    for (let i = nextWaypoint; i < waypoints.length; i++) {
      routeCoords.push([waypoints[i].lat, waypoints[i].lng]);
    }

    routeLine = L.polyline(routeCoords, { weight: 4 }).addTo(mapInstance);
    mapInstance.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
  }
</script>

<input type="file" accept=".csv" on:change={handleFileChange} />
<button on:click={handleCalculate}>Bereken route</button>

<div id="map" style="height: 500px;"></div>

<pre>{outputText}</pre>