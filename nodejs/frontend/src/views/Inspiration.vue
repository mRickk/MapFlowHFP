<script setup>
import { onMounted, ref, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getUser, createPoiInMap } from '@/services/userService';
import { getPOIs } from '@/services/poiService';
import { bubbleIcon } from '@/util/mapWaypoint'
import PoiInfoComponent from '../components/PoiInfoComponent.vue';
import InsertPOIModal from '@/components/InsertPOIModal.vue';
import { htmlMarkerIcon } from '@/util/mapWaypoint';

const searchQuery = ref('');
const selectedPoi = ref(null);
const isVideoModalOpen = ref(false);
const isInsertModalOpen = ref(false);
const insertPoiData = ref({ name: '', icon: 'pin', color: 'red' });

const activeMapMapId = ref(null);
const activeMap = ref(null);

function openVideoModal(poi) {
    selectedPoi.value = poi;
    isVideoModalOpen.value = true;
}

let mapInstance = null;

const addWaypoint = (p, customIcon = null) => {
    const marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(mapInstance);

    marker.on('click', () => {
        openVideoModal(p);
    });
    return marker;
};

const loadMapData = () => {
    const user = getUser();
    if (user && user.maps) {
        const map = user.maps.find(m => m.selected);
        activeMap.value = map;
        activeMapMapId.value = map ? map.id : null;
    }
};

const availableLayers = computed(() => {
    if (!activeMap.value || !activeMap.value.saved_poi) return [];
    const layers = new Set();
    activeMap.value.saved_poi.forEach(p => {
        if (p.layer) layers.add(p.layer);
    });
    return Array.from(layers).sort();
});

onMounted(() => {
    loadMapData();
    const video_pois = getPOIs().filter(poi => poi.video_url);
    const saved_pois = activeMap.value.saved_poi;

    const bounds = L.latLngBounds(saved_pois.map(poi => [poi.lat, poi.lng]));
    
    mapInstance = L.map('map', {
        zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    mapInstance.fitBounds(bounds, { padding: [50, 50] });

    video_pois.forEach(p => {
        addWaypoint(p, bubbleIcon());
    });

    activeMap.value.saved_poi.forEach(poi => {
        const icon = htmlMarkerIcon(poi.icon || "pin", poi.color || "blue", poi.must_have, true);
        const marker = L.marker([poi.lat, poi.lng], { icon });
        
        marker.addTo(mapInstance);
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

const handleCreatePoi = (poiData) => {
    if (!selectedPoi.value || !activeMap.value) return;

    const payload = {
        ...poiData,
        lat: selectedPoi.value.lat,
        lng: selectedPoi.value.lng
    };

    if (insertPoiData.value && insertPoiData.value.id) {
        payload.id = insertPoiData.value.id;
    }

    createPoiInMap(activeMap.value.id, payload);

    isInsertModalOpen.value = false;
    isVideoModalOpen.value = true;
    loadMapData();
};
</script>

<template>
    <div id="map" class="absolute inset-0 z-0"></div>

    <div v-if="isVideoModalOpen" 
     class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
     @click.self="isVideoModalOpen = false">
    
        <div class="relative bg-white border border-lesslight rounded-lg overflow-hidden w-full max-w-[450px] h-[800px] max-h-[90vh] flex flex-col">
            <PoiInfoComponent 
                :data="selectedPoi"
                :onAdd="() => { 
                    insertPoiData = {
                        id: selectedPoi.id,
                        name: selectedPoi.name,
                        icon: selectedPoi.icon || 'pin',
                        color: selectedPoi.color || 'blue'
                    };
                    isVideoModalOpen = false;
                    isInsertModalOpen = true;
                }"
                :onRemove="() => {
                    loadMapData();
                }"
                :onClose="() => { isVideoModalOpen = false }" 
            />

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

    <InsertPOIModal
        v-if="isInsertModalOpen"
        :layers="availableLayers"
        :initialName="insertPoiData.name"
        :initialIcon="insertPoiData.icon"
        :initialColor="insertPoiData.color"
        @close="() => {
            isInsertModalOpen = false;
        }"
        @create="handleCreatePoi"
    />
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