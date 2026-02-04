<script setup>
import { onMounted, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icona personalizzata con immagine
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icona creata con CSS (molto flessibile)
const htmlIcon = L.divIcon({
    html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
    className: 'custom-div-icon', // Rimuove lo stile di default bianco
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

// Riferimento all'istanza della mappa se ti serve fuori dall'onMounted
let mapInstance = null;
const waypoints = [];

// Funzione riutilizzabile per aggiungere un waypoint
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
        addWaypoint(e.latlng.lat, e.latlng.lng, "Punto Utente", redIcon);
    });

    addWaypoint(41.8902, 12.4922, "Capitale", redIcon);
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