<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getUser, createPoiInMap, removePoiFromMap } from '@/services/userService';
import { getPOIs } from '@/services/poiService';
import { bubbleIcon, htmlMarkerIcon, minZoomForLabels, userIcon } from '@/util/mapWaypoint';
import PoiInfoComponent from '../components/PoiInfoComponent.vue';
import InsertPOIModal from '@/components/InsertPOIModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

const selectedPoi = ref(null);
const isVideoModalOpen = ref(false);
const isInsertModalOpen = ref(false);
const insertPoiData = ref({ name: '', icon: 'pin', color: 'red' });
const showConfirmRemove = ref(false);
const activeMap = ref(null);
const isLocationAvailable = ref(false);
const userLocation = ref(null);

let mapInstance = null;
let markersLayer = null;

const availableLayers = computed(() => {
    if (!activeMap.value?.saved_poi) return [];
    const layers = new Set(activeMap.value.saved_poi.map(p => p.layer).filter(l => l));
    return Array.from(layers).sort();
});

const isPoiSaved = computed(() => {
    if (!activeMap.value?.saved_poi || !selectedPoi.value) return false;
    return activeMap.value.saved_poi.some(p => p.id === selectedPoi.value.id);
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
        ...selectedPoi.value,
        ...poiData,
    };

    createPoiInMap(activeMap.value.id, payload);
    isInsertModalOpen.value = false;
    isVideoModalOpen.value = false;
    loadMapData();
};

const handleRemovePoi = () => {
    if (selectedPoi.value) {
        showConfirmRemove.value = true;
    }
};

const confirmRemovePoi = () => {
    if (!selectedPoi.value || !activeMap.value) return;
    
    removePoiFromMap(activeMap.value.id, selectedPoi.value.id);
    loadMapData();
    
    showConfirmRemove.value = false;
    isVideoModalOpen.value = false;
};

const handleLocateUser = () => {
    if (!mapInstance) return;

    if (userLocation.value) {
         mapInstance.setView(userLocation.value, 18);
         return;
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                mapInstance.setView([latitude, longitude], 18);
            },
            (error) => {
                console.error("Error getting location", error);
            },
           {
                maximumAge: 10000, 
                timeout: 5000,
                enableHighAccuracy: true 
            }
        );
    }
};

const updateMarkers = () => {
    if (!mapInstance || !markersLayer) return;

    markersLayer.clearLayers();

    const savedPois = activeMap.value?.saved_poi.filter(poi => !poi.video_url) || [];
    const videoPois = getPOIs().filter(poi => poi.video_url);

    videoPois.forEach(p => {
        const selected = activeMap.value?.saved_poi.some(saved => saved.id === p.id);
        
        const marker = L.marker([p.lat, p.lng], { 
            icon: bubbleIcon(p.name, selected)
        });
        
        marker.on('click', () => openVideoModal(p));
        
        markersLayer.addLayer(marker);
    });

    savedPois.forEach(poi => {
        const icon = htmlMarkerIcon(poi.icon || "pin", poi.color || "blue", poi.must_have, true);
        const marker = L.marker([poi.lat, poi.lng], { icon });
        markersLayer.addLayer(marker);
    });
};
const initMap = () => {
    const savedPois = activeMap.value?.saved_poi.filter(poi => !poi.video_url) || [];
    const allPoints = savedPois.map(poi => [poi.lat, poi.lng]);
    const videoPois = getPOIs().filter(poi => poi.video_url);
    
    const bounds = allPoints.length > 0 
        ? L.latLngBounds(allPoints) 
        : L.latLngBounds([[41.9028, 12.4964]]); 

    mapInstance = L.map('map', { zoomControl: false });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    mapInstance.fitBounds(bounds, { padding: [50, 50] });

    videoPois.forEach(p => {
        const selected = activeMap.value?.saved_poi.some(saved => saved.id === p.id);
        const marker = L.marker([p.lat, p.lng], { icon: bubbleIcon(p.name, selected) }).addTo(mapInstance);
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

    markersLayer = L.layerGroup().addTo(mapInstance);
    
    updateMarkers();

    let userMarker = null;
    mapInstance.locate({ 
        setView: false, 
        watch: true,    
        enableHighAccuracy: true 
    });

    mapInstance.on('locationfound', (e) => {
        userLocation.value = e.latlng;
        if (userMarker) {
            userMarker.setLatLng(e.latlng);
        } else {
            userMarker = L.marker(e.latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance);
        }
    });

    mapInstance.on('locationerror', (e) => {
        console.warn("Posizione non trovata:", e.message);
    });
    
    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
};

watch(() => activeMap.value, () => {
    updateMarkers();
}, { deep: true });

onMounted(() => {
    isLocationAvailable.value = "geolocation" in navigator;
    loadMapData();
    if (activeMap.value) {
        initMap();
    }
});
</script>

<template>

    <button 
        class="fixed right-4 top-1/4 z-50 w-12 h-12 flex items-center justify-center bg-white border border-gray rounded-full shadow-md hover:bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleLocateUser"
        :disabled="!isLocationAvailable"
        title="Locate Me"
    >
        <i class="bi bi-crosshair text-xl"></i>
    </button>
    
    <div id="map" class="absolute inset-0 z-0"></div>

    <div v-if="isVideoModalOpen" 
         class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
         @click.self="isVideoModalOpen = false">
    
        <div class="relative bg-white border border-lesslight rounded-lg overflow-hidden w-full max-w-[450px] h-[800px] max-h-[90vh] flex flex-col">
            <PoiInfoComponent 
                :data="selectedPoi"
                :isSaved="isPoiSaved"
                @add="openInsertModal"
                @remove="handleRemovePoi"
                @close="isVideoModalOpen = false" 
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

    <ConfirmationModal
        v-if="showConfirmRemove"
        title="Rimuovi Punto di Interesse"
        class="z-[9999]"
        @confirm="confirmRemovePoi"
        @cancel="showConfirmRemove = false"
    >
        <p>Are you sure you want to remove <strong>{{ selectedPoi?.name }}</strong> from the map?</p>
    </ConfirmationModal>
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