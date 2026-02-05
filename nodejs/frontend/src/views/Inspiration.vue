<script setup>
import { onMounted, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const htmlIcon = L.divIcon({
    html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
    className: 'bi-bank2',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

let mapInstance = null;
const waypoints = [];

const addWaypoint = (lat, lng, title = "Waypoint", customIcon = null) => {
    const options = customIcon ? { icon: customIcon } : {};
    const marker = L.marker([lat, lng], options).addTo(mapInstance);
    marker.bindPopup(title);
    return marker;
};

onMounted(() => {
    mapInstance = L.map('map', {
        zoomControl: false
    }).setView([41.9028, 12.4964], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    mapInstance.on('click', (e) => {
        addWaypoint(e.latlng.lat, e.latlng.lng, "Punto Utente", htmlIcon);
    });

    addWaypoint(41.8902, 12.4922, "Capitale", htmlIcon);
    addWaypoint(45.4642, 9.1900, "Nodo Tecnico", htmlIcon);

    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
});
</script>

<template>
    <div id="map" class="absolute inset-0 z-0"></div>
</template>

<style>
html, body, #app {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.leaflet-control-container {
    z-index: 10; 
}
</style>