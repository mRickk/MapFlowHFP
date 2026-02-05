<script setup>
import { onMounted, ref, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getUser, createPoiInMap } from '@/services/userService';
import { getPOIs } from '@/services/poiService';
import { bubbleIcon, htmlMarkerIcon, minZoomForLabels } from '@/util/mapWaypoint';
import PoiInfoComponent from '../components/PoiInfoComponent.vue';
import InsertPOIModal from '@/components/InsertPOIModal.vue';

const selectedPoi = ref(null);
const isVideoModalOpen = ref(false);
const isInsertModalOpen = ref(false);
const insertPoiData = ref({ name: '', icon: 'pin', color: 'red' });
const activeMap = ref(null);

let mapInstance = null;

const availableLayers = computed(() => {
    if (!activeMap.value?.saved_poi) return [];
    const layers = new Set(activeMap.value.saved_poi.map(p => p.layer).filter(l => l));
    return Array.from(layers).sort();
});

const getInstagramEmbedUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    return `${cleanUrl}/embed/captioned/`;
};

const loadMapData = () => {
    const user = getUser();
    if (user?.maps) {
        activeMap.value = user.maps.find(m => m.selected) || null;
    }
};

const openVideoModal = (poi) => {
    selectedPoi.value = poi;
    isVideoModalOpen.value = true;
};

const openInsertModal = () => {
    insertPoiData.value = {
        id: selectedPoi.value.id,
        name: selectedPoi.value.name,
        icon: selectedPoi.value.icon || 'pin',
        color: selectedPoi.value.color || 'blue'
    };
    isVideoModalOpen.value = false;
    isInsertModalOpen.value = true;
};

const handleCreatePoi = (poiData) => {
    if (!selectedPoi.value || !activeMap.value) return;

    const payload = {
        ...poiData,
        lat: selectedPoi.value.lat,
        lng: selectedPoi.value.lng,
        id: insertPoiData.value?.id
    };

    createPoiInMap(activeMap.value.id, payload);
    isInsertModalOpen.value = false;
    isVideoModalOpen.value = true;
    loadMapData();
};

const initMap = () => {
    const savedPois = activeMap.value?.saved_poi || [];
    const videoPois = getPOIs().filter(poi => poi.video_url);
    const allPoints = savedPois.map(poi => [poi.lat, poi.lng]);
    
    const bounds = allPoints.length > 0 
        ? L.latLngBounds(allPoints) 
        : L.latLngBounds([[41.9028, 12.4964]]); 

    mapInstance = L.map('map', { zoomControl: false });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    mapInstance.fitBounds(bounds, { padding: [50, 50] });

    videoPois.forEach(p => {
        const marker = L.marker([p.lat, p.lng], { icon: bubbleIcon(12, p.name) }).addTo(mapInstance);
        marker.on('click', () => openVideoModal(p));
    });

    savedPois.forEach(poi => {
        const icon = htmlMarkerIcon(poi.icon || "pin", poi.color || "blue", poi.must_have, true, 30, poi.name);
        L.marker([poi.lat, poi.lng], { icon }).addTo(mapInstance);
    });

    const updateLabelsVisibility = () => {
        const mapEl = document.getElementById('map');
        if (!mapEl) return;
        if (mapInstance.getZoom() >= minZoomForLabels) {
            mapEl.classList.add('show-marker-labels');
        } else {
            mapEl.classList.remove('show-marker-labels');
        }
    };
    mapInstance.on('zoomend', updateLabelsVisibility);
    updateLabelsVisibility();

    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
};

onMounted(() => {
    loadMapData();
    if (activeMap.value) {
        initMap();
    }
});
</script>

<template>
    <div id="map" class="absolute inset-0 z-0"></div>

    <div v-if="isVideoModalOpen" 
         class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
         @click.self="isVideoModalOpen = false">
    
        <div class="relative bg-white border border-lesslight rounded-lg overflow-hidden w-full max-w-[450px] h-[800px] max-h-[90vh] flex flex-col">
            <PoiInfoComponent 
                :data="selectedPoi"
                :onAdd="openInsertModal"
                :onRemove="loadMapData"
                :onClose="() => isVideoModalOpen = false" 
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
        @close="isInsertModalOpen = false"
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

.show-marker-labels .marker-label {
    display: block !important;
}
</style>