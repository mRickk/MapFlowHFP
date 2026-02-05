<script setup>
import { onMounted, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getUser } from '@/services/userService';
import { getPOIs } from '@/services/poiService';
import SelectedLegend from '@/components/SelectedLegend.vue';
import SearchBar from '@/components/SearchBar.vue';
import { bubbleIcon } from '@/util/mapWaypoint'
import PoiInformationComponent from '@/components/PoiInformationComponent.vue';

const searchQuery = ref('');
const selectedPoi = ref(null);
const isModalOpen = ref(false);

function apriModaleVideo(poi) {
    selectedPoi.value = poi;
    isModalOpen.value = true;
}

let mapInstance = null;

const addWaypoint = (p, customIcon = null) => {
    const marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(mapInstance);

    marker.on('click', () => {
        apriModaleVideo(p);
    });
    return marker;
};

onMounted(() => {
    const pois = getPOIs().filter(poi => poi.video_url);
    const bounds = L.latLngBounds(pois.map(poi => [poi.lat, poi.lng]));
    
    mapInstance = L.map('map', {
        zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    mapInstance.fitBounds(bounds, { padding: [50, 50] });

    pois.forEach(p => {
        addWaypoint(p, bubbleIcon());
    });

    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
});

const getInstagramEmbedUrl = (url) => {
    if (!url) return '';
    let cleanUrl = url.split('?')[0].replace(/\/$/, '');
    cleanUrl = `${cleanUrl}/embed/captioned/`;
    
    return cleanUrl;
};
</script>

<template>
    <div class="absolute top-0 left-0 w-full z-10 p-8">
        <SearchBar 
            v-model="searchQuery"
            class="" 
        />
    </div>
    <SelectedLegend :mapId="getUser().maps.find(map => map.selected).id" class="z-10"/>
    <div id="map" class="absolute inset-0 z-0"></div>

    <div v-if="isModalOpen" 
     class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
     @click.self="isModalOpen = false">
    
        <div class="relative bg-white border border-lesslight rounded-lg overflow-hidden w-full max-w-[450px] h-[800px] max-h-[90vh] flex flex-col">
            <PoiInformationComponent :data="selectedPoi" :onClose="() => { isModalOpen = false }" />

            <div class="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                <iframe 
                    :src="getInstagramEmbedUrl(selectedPoi?.video_url)"
                    class="w-full h-full border-0"
                    allowtransparency="true"
                    allowfullscreen="true"
                    frameborder="0"
                    scrolling="no">
                </iframe>
            </div>
        </div>
    </div>
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