<script setup>
import SelectedLegend from '@/components/SelectedLegend.vue';
import InsertPOIModal from '@/components/InsertPOIModal.vue';
import POIDetailsCard from '@/components/POIDetailsCard.vue';
import SearchBar from '@/components/SearchBar.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { temporaryMarkerIcon, htmlMarkerIcon, userIcon } from '@/util/mapWaypoint';
import { onMounted, ref, watch, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getUser, createPoiInMap, removePoiFromMap } from '@/services/userService';
import { getPOIs } from '@/services/poiService';

let mapInstance = null;
const activeMapMapId = ref(null);
const activeMap = ref(null);
const selectedLegendRef = ref(null);
const markerLayerGroup = L.layerGroup();
const tempMarkerLayer = L.layerGroup();
const showInsertModal = ref(false);
const showPoiDetails = ref(false);
const showConfirmRemove = ref(false);
const selectedPoi = ref(null);
const insertCoords = ref(null);
const insertPoiData = ref({ name: '', icon: 'pin', color: 'red' });
const searchQuery = ref('');

const availableLayers = computed(() => {
    if (!activeMap.value || !activeMap.value.saved_poi) return [];
    const layers = new Set();
    activeMap.value.saved_poi.forEach(p => {
        if (p.layer) layers.add(p.layer);
    });
    return Array.from(layers).sort();
});

const isPoiSaved = computed(() => {
    if (!selectedPoi.value || !activeMap.value || !activeMap.value.saved_poi) return false;
    return activeMap.value.saved_poi.some(p => p.id === selectedPoi.value.id);
});

const legendKey = ref(0);

const loadMapData = () => {
    const user = getUser();
    if (user && user.maps) {
        const map = user.maps.find(m => m.selected);
        activeMap.value = map;
        activeMapMapId.value = map ? map.id : null;
    }
};

const renderMarkers = () => {
    markerLayerGroup.clearLayers();
    if (!activeMap.value || !activeMap.value.saved_poi) return;

    activeMap.value.saved_poi.forEach(poi => {
        const icon = htmlMarkerIcon(poi.icon || "pin", poi.color || "blue", poi.must_have, true);
        const marker = L.marker([poi.lat, poi.lng], { icon });
        
        marker.on('click', () => {
            selectedPoi.value = poi;
            showPoiDetails.value = true;
        });
        
        marker.addTo(markerLayerGroup);
    });

    const allPois = getPOIs();
    allPois.forEach(poi => {
        if (activeMap.value.saved_poi.find(p => p.id === poi.id)) return;
    
        const icon = htmlMarkerIcon(poi.icon || "pin", poi.color || "blue", false, false);
        const marker = L.marker([poi.lat, poi.lng], { icon });
        
        marker.on('click', () => {
            selectedPoi.value = poi;
            showPoiDetails.value = true;
        });
        
        marker.addTo(markerLayerGroup);
    });
};

const handleAddFromInfo = (poi) => {
    if (!selectedPoi.value) return;

    insertPoiData.value = {
        id: selectedPoi.value.id,
        name: selectedPoi.value.name,
        icon: selectedPoi.value.icon || 'pin',
        color: selectedPoi.value.color || 'blue'
    };
    
    insertCoords.value = { lat: selectedPoi.value.lat, lng: selectedPoi.value.lng };

    showPoiDetails.value = false;
    showInsertModal.value = true;
};


const handleRemoveFromInfo = (poi) => {
    if (selectedPoi.value) {
        showConfirmRemove.value = true;
    }
};

const confirmRemovePoi = () => {
    if (!selectedPoi.value || !activeMap.value) return;
    
    removePoiFromMap(activeMap.value.id, selectedPoi.value.id);
    loadMapData();
    renderMarkers();
    legendKey.value++; 
    
    showConfirmRemove.value = false;
    showPoiDetails.value = false;
};

const handleCreatePoi = (poiData) => {
    if (!insertCoords.value || !activeMap.value) return;
    
    const payload = {
        ...selectedPoi.value,
        ...poiData
    };

    if (insertPoiData.value && insertPoiData.value.id) {
        payload.id = insertPoiData.value.id;
    }

    createPoiInMap(activeMap.value.id, payload);

    closeInsertModal();
    loadMapData();
    renderMarkers();
    legendKey.value++;
};

const handleMapUpdated = () => {
    loadMapData();
    renderMarkers();
};

const handleCenterPoi = (poiId) => {
    if (!activeMap.value || !activeMap.value.saved_poi) return;
    const poi = activeMap.value.saved_poi.find(p => p.id === poiId);
    if (poi && mapInstance) {
        mapInstance.setView([poi.lat, poi.lng], 18);
        selectedPoi.value = poi;
    }
};

const closeInsertModal = () => {
    showInsertModal.value = false;
    insertCoords.value = null;
    tempMarkerLayer.clearLayers();
    insertPoiData.value = { name: '', icon: 'pin', color: 'red' };
};

const handlePoiSelected = (poi) => {
    if (!mapInstance) return;
    mapInstance.setView([poi.lat, poi.lng], 18);
    selectedPoi.value = poi;
    showPoiDetails.value = true;
};

onMounted(() => {
    loadMapData();
    
    mapInstance = L.map('map', {
        zoomControl: false
    });

    if (activeMap.value && activeMap.value.saved_poi && activeMap.value.saved_poi.length > 0) {
        const bounds = L.latLngBounds(activeMap.value.saved_poi.map(p => [p.lat, p.lng]));
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
    } else {
        mapInstance.setView([41.9028, 12.4964], 6);
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    markerLayerGroup.addTo(mapInstance);
    tempMarkerLayer.addTo(mapInstance);

    let userMarker = null;

    mapInstance.locate({ 
        setView: false,
        watch: true,
        enableHighAccuracy: true 
    });

    mapInstance.on('locationfound', (e) => {
        if (userMarker) {
            userMarker.setLatLng(e.latlng);
        } else {
            userMarker = L.marker(e.latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance);
        }
    });

    mapInstance.on('locationerror', (e) => {
        console.warn("Posizione non trovata:", e.message);
    });

    mapInstance.on('contextmenu', (e) => {
        tempMarkerLayer.clearLayers();
        const marker = L.marker(e.latlng, { icon: temporaryMarkerIcon() });
        marker.addTo(tempMarkerLayer);
        insertCoords.value = e.latlng;
        
        marker.on('click', () => {
             insertPoiData.value = { name: '', icon: 'pin', color: 'red' };
             showInsertModal.value = true;
        });
    });
    
    renderMarkers();

    setTimeout(() => {
         mapInstance.invalidateSize();
    }, 100);
});
</script>

<template>
     <div class="absolute top-0 left-0 w-full z-10 p-8">
        <SearchBar 
            v-model="searchQuery"
            class="" 
            @poi-selected="handlePoiSelected"
        />
    </div>
    
    <SelectedLegend 
        v-if="activeMapMapId"
        :key="legendKey"
        ref="selectedLegendRef"
        :mapId="activeMapMapId" 
        class="z-10"
        @mapUpdated="handleMapUpdated"
        @center-poi="handleCenterPoi"
    />
    
    <POIDetailsCard 
        :visible="showPoiDetails"
        :poi="selectedPoi"
        :isSaved="isPoiSaved"
        @add="handleAddFromInfo"
        @remove="handleRemoveFromInfo"
        @close="showPoiDetails = false"
    />

    <ConfirmationModal
        v-if="showConfirmRemove"
        title="Rimuovi Punto di Interesse"
        @confirm="confirmRemovePoi"
        @cancel="showConfirmRemove = false"
    >
        <p>Sei sicuro di voler rimuovere <strong>{{ selectedPoi?.name }}</strong> dalla mappa?</p>
        <p class="text-sm text-gray-500 mt-2">Questa azione non può essere annullata.</p>
    </ConfirmationModal>
    <InsertPOIModal
        v-if="showInsertModal"
        :layers="availableLayers"
        :initialName="insertPoiData.name"
        :initialIcon="insertPoiData.icon"
        :initialColor="insertPoiData.color"
        @close="closeInsertModal"
        @create="handleCreatePoi"
    />

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