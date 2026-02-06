<script setup>
import SelectedLegend from '@/components/SelectedLegend.vue';
import InsertPOIModal from '@/components/InsertPOIModal.vue';
import POIDetailsCard from '@/components/POIDetailsCard.vue';
import SearchBar from '@/components/SearchBar.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { temporaryMarkerIcon, htmlMarkerIcon, minZoomForLabels, userIcon } from '@/util/mapWaypoint';
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { getUser, createPoiInMap, removePoiFromMap } from '@/services/userService';
import { getPOIs } from '@/services/poiService';

import L from 'leaflet';
window.L = L;
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

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
const isLocationAvailable = ref(false);
const userLocation = ref(null);
const routeReminder = ref(null);
const dismissedReminders = ref(new Set());
const lastRouteDuration = ref(0);
const nextPoiRef = ref(null);
let routingControl = null;
let statusCheckInterval = null;

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
        const icon = htmlMarkerIcon(poi.icon || "pin", poi.color || "blue", poi.must_have, true, 30, poi.name);
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
    
        const icon = htmlMarkerIcon(poi.icon || "pin", poi.color || "blue", false, false, 30, poi.name);
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
    updateRoute();
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
    updateRoute();
    legendKey.value++;
};

const handleMapUpdated = () => {
    loadMapData();
    renderMarkers();
    updateRoute();
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

const checkRouteStatus = () => {
    if (!nextPoiRef.value || lastRouteDuration.value === 0) {
        routeReminder.value = null;
        return;
    }

    const now = new Date();
    const nextTime = new Date(nextPoiRef.value.datetime);
    const arrivalTime = new Date(now.getTime() + lastRouteDuration.value * 1000);
    
    let potentialReminder = null;

    if (arrivalTime > nextTime) {
        const delayMinutes = Math.ceil((arrivalTime - nextTime) / (1000 * 60));
        potentialReminder = {
            type: 'error',
            message: `You are late for ${nextPoiRef.value.name} by ${delayMinutes} minute${delayMinutes === 1 ? '' : 's'}.${nextPoiRef.value.must_have ? "" : " We recommend skipping it."}`,
            key: `${nextPoiRef.value.id}_late`
        };
    } else if ((nextTime - arrivalTime) < 10 * 60 * 1000) {
         potentialReminder = {
            type: 'warning',
            message: `Warning: You will arrive at ${nextPoiRef.value.name} with less than 10 minutes to spare.`,
            key: `${nextPoiRef.value.id}_soon`
        };
    }

    if (potentialReminder && !dismissedReminders.value.has(potentialReminder.key)) {
        if (routeReminder.value?.key !== potentialReminder.key) {
             routeReminder.value = potentialReminder;
        }
    } else {
        routeReminder.value = null;
    }
};

const dismissReminder = () => {
    if (routeReminder.value && routeReminder.value.key) {
        dismissedReminders.value.add(routeReminder.value.key);
    }
    routeReminder.value = null;
};

const updateRoute = () => {
    if (!activeMap.value || !activeMap.value.saved_poi || !mapInstance) return;
    
    const sortedPois = [...activeMap.value.saved_poi]
        .filter(p => p.datetime) 
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (sortedPois.length < 2) return;

    const now = new Date();
    const nextIndex = sortedPois.findIndex(p => new Date(p.datetime) > now);
    
    if (nextIndex === -1 || nextIndex === 0) {
        if (routingControl) {
            routingControl.setWaypoints([]);
        }
        nextPoiRef.value = null;
        routeReminder.value = null;
        return;
    }

    const nextPoi = sortedPois[nextIndex];
    const prevPoi = sortedPois[nextIndex - 1];
    
    nextPoiRef.value = nextPoi;

    if (routingControl) {
        routingControl.setWaypoints([
            L.latLng(prevPoi.lat, prevPoi.lng),
            L.latLng(nextPoi.lat, nextPoi.lng)
        ]);
    }
};

onUnmounted(() => {
    if (statusCheckInterval) clearInterval(statusCheckInterval);
});

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

onMounted(() => {
    isLocationAvailable.value = "geolocation" in navigator;
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

    if (!L.Routing.OpenRouteService){
      L.Routing.OpenRouteService = L.Class.extend({
        initialize: function(apiKey, options) {
          this._apiKey = apiKey;
          this._options = options || {};
        },
        route: function(waypoints, callback, context, options) {
          const wps = waypoints.map(wp => [wp.latLng.lng, wp.latLng.lat]);
          const profile = this._options.profile || 'driving-car';
          const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

          fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': this._apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coordinates: wps })
          })
              .then(response => response.json())
              .then(data => {
                if (!data.features || data.features.length === 0) {
                  callback.call(context, { status: 400, message: "No route found" }, null);
                  return;
                }
                const route = data.features[0];
                const coordinates = route.geometry.coordinates.map(c => L.latLng(c[1], c[0]));
                const summary = route.properties.summary;

                const result = {
                  name: 'OpenRouteService',
                  coordinates: coordinates,
                  instructions: [],
                  summary: {
                    totalDistance: summary.distance,
                    totalTime: summary.duration
                  },
                  inputWaypoints: waypoints
                };
                callback.call(context, null, [result]);
              })
              .catch(err => {
                callback.call(context, err, null);
              });
        }
      });

      L.Routing.openrouteservice = function(apiKey, options) {
        return new L.Routing.OpenRouteService(apiKey, options);
      };
    }

    routingControl = L.Routing.control({
      waypoints: [], 
      hints: {
        locations: []
      },
      router: L.Routing.openrouteservice('eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjU3ZjIwNzE1ZjliNDQzZDM5YjJlYjIxMTFmNmQxOGRjIiwiaCI6Im11cm11cjY0In0=', {
        profile: 'foot-walking',
        timeout: 300000
      }),
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false,
      createMarker: function() { return null; },
      lineOptions: {
        styles: [{color: 'green', opacity: 0.8, weight: 6, dashArray: '10, 10'}]
      }
    }).addTo(mapInstance);

    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;

      const timeInMinutes = Math.round(summary.totalTime / 60);

      const distanceInKm = (summary.totalDistance / 1000).toFixed(2);

      lastRouteDuration.value = summary.totalTime;
      checkRouteStatus();
    });

    updateRoute();
    statusCheckInterval = setInterval(() => {
        updateRoute();
        checkRouteStatus();
    }, 60000);

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
        <div v-if="routeReminder" 
             :class="['mt-4 p-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 flex justify-between items-center', 
                      routeReminder.type === 'error' ? 'bg-red-600' : 'bg-yellow-600']">
            <div class="flex items-center">
                 <i :class="['bi mr-2 text-xl', routeReminder.type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-exclamation-triangle-fill']"></i>
                 <span>{{ routeReminder.message }}</span>
            </div>
            <button @click="dismissReminder" class="ml-4 focus:outline-none hover:opacity-80">
                <i class="bi bi-x-lg text-lg"></i>
            </button>
        </div>
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
    
    <button 
        class="fixed right-4 top-1/4 z-50 w-12 h-12 flex items-center justify-center bg-white border border-gray rounded-full shadow-md hover:bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleLocateUser"
        :disabled="!isLocationAvailable"
        title="Locate Me"
    >
        <i class="bi bi-crosshair text-xl"></i>
    </button>

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
        <p>Are you sure you want to remove <strong>{{ selectedPoi?.name }}</strong> from the map?</p>
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
.leaflet-control-container {
    z-index: 10; 
}

.show-marker-labels .marker-label {
    display: block !important;
}

.leaflet-routing-container {
  display: none !important;
}
</style>