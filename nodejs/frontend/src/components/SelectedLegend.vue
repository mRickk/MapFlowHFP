<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatTime } from '@/util/dateTime.js';
import { updatePoiInMap } from '@/services/userService';
import { getMap } from '@/services/userService';
import { getPOI } from '@/services/poiService';

const props = defineProps({
  mapId: {
    type: [String, Number],
    required: true
  }
});

const isOpen = ref(false);
const activeTab = ref('layers');
const mapData = ref(null);
const poiDetails = ref({});
const collapsedGroups = ref({});
const layers = ref([]);
const selectedPoiId = ref(null);
const selectedLayerName = ref(null);
const touchDragState = ref({
  active: false,
  poi: null,
  fromLayer: null,
  x: 0,
  y: 0
});
let touchStartX = 0;
let touchStartY = 0;

const fetchMapData = async (id) => {
  return await getMap(id);
};

const fetchPoiDetails = async (id) => {
  return await getPOI(id);
};

onMounted(async () => {
  if (props.mapId) {
    const data = await fetchMapData(props.mapId);
    mapData.value = data;

    if (data.saved_poi) {
      const initialLayers = new Set();
      for (const poi of data.saved_poi) {
        initialLayers.add(poi.layer || 'Uncategorized');
        const detail = await fetchPoiDetails(poi.id);
        poiDetails.value[poi.id] = detail;
      }
      layers.value = Array.from(initialLayers).sort();
    }
  }
});

const enrichedPois = computed(() => {
  if (!mapData.value || !mapData.value.saved_poi) return [];
  return mapData.value.saved_poi.map(poi => ({
    ...poi,
    details: poiDetails.value[poi.id] || {}
  }));
});

const groupedByLayer = computed(() => {
  const groups = {};
  
  layers.value.forEach(layer => {
      groups[layer] = [];
  });

  enrichedPois.value.forEach(poi => {
    const layer = poi.layer || 'Uncategorized';
    if (!groups[layer]) {
        groups[layer] = [];
    }
    groups[layer].push(poi);
  });
  return groups;
});

const addLayer = () => {
  let counter = 1;
  let newName = `New Layer ${counter}`;
  
  while (layers.value.includes(newName)) {
    counter++;
    newName = `New Layer ${counter}`;
  }
  
  layers.value.push(newName);
};

const groupedByDate = computed(() => {
  const groups = {};
  const sorted = [...enrichedPois.value].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  
  sorted.forEach(poi => {
    const date = poi.datetime.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(poi);
  });
  return groups;
});

const toggleSidebar = () => isOpen.value = !isOpen.value;
const toggleGroup = (key) => {
  collapsedGroups.value = {
    ...collapsedGroups.value,
    [key]: !collapsedGroups.value[key]
  };
};

const selectPoi = (id) => {
  selectedPoiId.value = selectedPoiId.value === id ? null : id;
};

const selectLayer = (name) => {
  selectedLayerName.value = selectedLayerName.value === name ? null : name;
};

const onDragStart = (event, poi, fromLayer) => {
  event.dataTransfer.dropEffect = 'move';
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('poiId', poi.id);
  event.dataTransfer.setData('fromLayer', fromLayer);
  selectedPoiId.value = null; 
};

const onDrop = (event, toLayer) => {
  const poiId = parseInt(event.dataTransfer.getData('poiId'));
  movePoi(poiId, toLayer);
};

const onTouchStart = (e, poi, layerName) => {
  if (e.touches.length > 1) return;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  
  touchDragState.value = { 
    active: false,
    poi: poi, 
    fromLayer: layerName, 
    x: touch.clientX, 
    y: touch.clientY
  };
};

const onTouchMove = (e) => {
  if (!touchDragState.value.poi) return;
  
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  
  if (!touchDragState.value.active && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
    touchDragState.value.active = true;
    selectedPoiId.value = null;
  }
  
  if (touchDragState.value.active) {
    if (e.cancelable) e.preventDefault();
    touchDragState.value.x = touch.clientX;
    touchDragState.value.y = touch.clientY;
  }
};

const onTouchEnd = (e) => {
  if (!touchDragState.value.poi) return;
  
  if (touchDragState.value.active) {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const layerEl = target?.closest('[data-layer-name]');
             
    if (layerEl) {
      const toLayer = layerEl.getAttribute('data-layer-name');
      if (toLayer && toLayer !== touchDragState.value.fromLayer) {
         movePoi(touchDragState.value.poi.id, toLayer);
      }
    }
  }
  touchDragState.value = { active: false, poi: null, fromLayer: null, x: 0, y: 0 };
};
          

const movePoi = (poiId, toLayer) => {
  if (poiId && mapData.value) {
    const poiIndex = mapData.value.saved_poi.findIndex(p => p.id === poiId);
    if (poiIndex !== -1) {
      mapData.value.saved_poi[poiIndex].layer = toLayer;
      updatePoiInMap(props.mapId, mapData.value.saved_poi[poiIndex]);
    }
  }
};

const logAction = (action, poi) => {
  console.log(`Action: ${action}`, poi);
};

</script>

<template>
  <div>
    <button 
      class="fixed left-0 top-1/4 z-50 p-2 bg-white border border-gray rounded-r shadow-md hover:bg-light transition-colors"
      @click="toggleSidebar"
      v-if="!isOpen"
    >
      <i class="bi bi-list-ul text-xl"></i>
    </button>

    <!-- <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      @click="isOpen = false"
    ></div> -->

    <div 
      class="fixed top-0 left-0 h-full w-80 bg-light shadow-xl z-50 transition-transform duration-300 flex flex-col"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div 
        v-if="touchDragState.active"
        class="fixed z-[100] bg-white p-3 rounded shadow-xl opacity-90 pointer-events-none border border-blue-500 transform -translate-x-1/2 -translate-y-1/2 w-64 flex items-center gap-2"
        :style="{ left: touchDragState.x + 'px', top: touchDragState.y + 'px' }"
      >
        <i class="bi bi-geo-alt-fill text-lg text-gray-500"></i>
        <span class="text-xs font-bold truncate">{{ touchDragState.poi?.details.name }}</span>
      </div>

      
      <div class="p-4 flex justify-between items-center">
        <h2 class="text-lg font-bold truncate">{{ mapData?.name || 'Loading Map...' }}</h2>
        <button @click="isOpen = false" class="hover:text-bright">
          <i class="bi bi-chevron-left text-xl"></i>
        </button>
      </div>

      <div class="p-4">
        <div class="flex gap-2 p-1 bg-white rounded-lg">
          <button 
            class="flex-1 py-1 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            :class="activeTab === 'layers' ? 'bg-gray-800 text-white shadow' : 'text-gray-700 hover:bg-lightergray'"
            @click="activeTab = 'layers'"
          >
            <i class="bi bi-stack"></i> Layers
          </button>
          <button 
            class="flex-1 py-1 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            :class="activeTab === 'timeline' ? 'bg-gray-800 text-white shadow' : 'text-gray-700 hover:bg-lightergray'"
            @click="activeTab = 'timeline'"
          >
            <i class="bi bi-clock-fill"></i> Timeline
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        
        <div v-if="activeTab === 'layers'">
          <div 
            v-for="(pois, layerName) in groupedByLayer" 
            :key="layerName"
            class="mb-4"
            @dragover.prevent 
            @drop="onDrop($event, layerName)"
            :data-layer-name="layerName"
          >
            <div 
              class="flex items-center gap-2 mb-2 group cursor-pointer p-1 rounded transition-colors"
              :class="{ 'bg-white': selectedLayerName === layerName }"
              @click="selectLayer(layerName)"
            >
              <input 
                type="checkbox" 
                class="form-checkbox h-4 w-4"
                :checked="!collapsedGroups[layerName]"
                @change="toggleGroup(layerName)"
                @click.stop
              >
              <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wider">{{ layerName }}</h3>
              <button 
                @click.stop="logAction('editLayer', layerName)" 
                class="ml-2 text-gray-400 hover:text-cyan active:text-cyan transition-opacity"
                :class="{ 'opacity-100': selectedLayerName === layerName, 'opacity-0 group-hover:opacity-100': selectedLayerName !== layerName }"
                title="Rename Layer"
              >
                <i class="bi bi-pencil-fill"></i>
              </button>
            </div>

            <div :class="{ 'opacity-50 grayscale': collapsedGroups[layerName] }">
              <div 
                v-for="poi in pois" 
                :key="poi.id"
                draggable="true"
                @touchstart="onTouchStart($event, poi, layerName)"
                @touchmove="onTouchMove($event)"
                @touchend="onTouchEnd($event)"
                @click="selectPoi(poi.id)"
                class="group rounded-xl ml-3 mb-1 p-1 flex items-center justify-between transition-colors cursor-move border border-transparent hover:border-lightergray"
                :class="{ 'bg-white border-lightergray': selectedPoiId === poi.id, 'hover:bg-white': selectedPoiId !== poi.id }"
              >
                <div class="flex items-center gap-3 select-none">
                  <i 
                    class="bi bi-geo-alt-fill text-lg" 
                    :style="{ color: poi.color }"
                  ></i>
                  <span class="text-gray-800 font-medium text-sm">{{ poi.details.name || `POI ${poi.id}` }}</span>
                </div>
                
                <div 
                   class="flex gap-2 transition-opacity"
                   :class="{ 'opacity-100': selectedPoiId === poi.id, 'opacity-0 group-hover:opacity-100': selectedPoiId !== poi.id }"
                >
                  <button @click.stop="logAction('edit', poi)" class="text-gray hover:text-cyan active:text-cyan" title="Edit POI">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button @click="logAction('remove', poi)" class="text-gray hover:text-red active:text-red" title="Remove POI">
                    <i class="bi bi-dash-circle-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            @click="addLayer"
            class="w-full py-2 border-2 border-dashed border-green text-green rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <i class="bi bi-plus-circle-fill"></i> <span class="font-semibold">Add a new layer</span>
          </button>
        </div>

         <div v-else>
          <div 
            v-for="(pois, date) in groupedByDate" 
            :key="date"
            class="mb-4"
          >
            <div class="flex items-center gap-2 mb-2 sticky top-0 bg-light z-10 py-1">
              <input 
                type="checkbox" 
                class="form-checkbox h-4 w-4"
                :checked="!collapsedGroups[date]"
                @change="toggleGroup(date)"
              >
              <h3 class="text-sm font-bold text-dark">{{ date }}</h3>
            </div>

            <div :class="{ 'opacity-50 grayscale': collapsedGroups[date] }">
              <div 
                v-for="poi in pois" 
                :key="poi.id"
                @click="selectPoi(poi.id)"
                class="group rounded-xl ml-3 mb-1 p-1 flex items-center justify-between transition-colors border-l-4 border-gray-300"
                :class="{ 'bg-white': selectedPoiId === poi.id, 'hover:bg-white': selectedPoiId !== poi.id }"
              >
                <div class="flex items-center gap-3 w-full select-none">
                  <span class="text-xs font-mono px-1 py-0.5 text-xl text-darker">
                    {{ formatTime(poi.datetime) }}
                  </span>
                  
                  <div class="flex flex-col overflow-hidden">
                    <span class="text-gray-800 font-medium text-sm truncate">{{ poi.details.name || `POI ${poi.id}` }}</span>
                    <span class="text-xs text-gray-500 truncate" v-if="poi.details.category">{{ poi.details.category }}</span>
                  </div>
                </div>

                <div 
                  class="flex gap-2 shrink-0 ml-2 transition-opacity"
                  :class="{ 'opacity-100': selectedPoiId === poi.id, 'opacity-0 group-hover:opacity-100': selectedPoiId !== poi.id }"
                >
                   <button @click.stop="logAction('reschedule', poi)" class="text-gray hover:text-cyan" title="Reschedule">
                    <i class="bi bi-calendar-fill"></i>
                  </button>
                  <button @click.stop="logAction('calendar-remove', poi)" class="text-gray hover:text-red" title="Remove from schedule">
                    <i class="bi bi-calendar2-x"></i>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>