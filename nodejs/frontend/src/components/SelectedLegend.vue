<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatTime, getCurrentLocalISO } from '@/util/dateTime.js';
import { getIconClass, getColorValue } from '@/util/colorIcons';
import { updatePoiInMap, removePoiFromMap } from '@/services/userService';
import { getMap } from '@/services/userService';

import LayerEditModal from './LayerEditModal.vue';
import POIEditModal from './POIEditModal.vue';
import TimelineEditModal from './TimelineEditModal.vue';
import ConfirmationModal from './ConfirmationModal.vue';

const props = defineProps({
  mapId: {
    type: [String, Number],
    required: true
  }
});

const isOpen = ref(false);
const activeTab = ref('layers');
const mapData = ref(null);
const collapsedGroups = ref({});
const layers = ref([]);
const selectedPoiId = ref(null);
const selectedLayerName = ref(null);

const showLayerEdit = ref(false);
const showPoiEdit = ref(false);
const showTimelineEdit = ref(false);
const showDeleteConfirm = ref(false);
const showRemoveTimeConfirm = ref(false);

const editingLayerData = ref({ originalName: '', name: '', color: '', icon: '' });
const editingPoiData = ref(null);
const deletingPoiData = ref(null);
const removePoiTimeData = ref(null);

const touchDragState = ref({
  active: false,
  poi: null,
  fromLayer: null,
  x: 0,
  y: 0
});
let touchStartX = 0;
let touchStartY = 0;

const emit = defineEmits(['mapUpdated']);

const fetchMapData = async (id) => {
  return await getMap(id);
};

const selectPoi = (id) => {
  selectedPoiId.value = id;
  isOpen.value = true;
};

defineExpose({
  selectPoi,
  isOpen
});

onMounted(async () => {
  if (props.mapId) {
    const data = await fetchMapData(props.mapId);
    mapData.value = data;

    if (data.saved_poi) {
      const initialLayers = new Set();
      for (const poi of data.saved_poi) {
        initialLayers.add(poi.layer || 'Uncategorized');
      }
      layers.value = Array.from(initialLayers).sort();
    }
  }
});

const enrichedPois = computed(() => {
  if (!mapData.value || !mapData.value.saved_poi) return [];
  return mapData.value.saved_poi;
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
  const noTimeKey = 'No time selected';
  
  const withTime = enrichedPois.value
    .filter(p => p.datetime)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
  const withoutTime = enrichedPois.value
    .filter(p => !p.datetime);

  withTime.forEach(poi => {
    const date = poi.datetime.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(poi);
  });
  
  if (withoutTime.length > 0) {
    groups[noTimeKey] = withoutTime;
  }

  return groups;
});

const toggleSidebar = () => isOpen.value = !isOpen.value;
const toggleGroup = (key) => {
  collapsedGroups.value = {
    ...collapsedGroups.value,
    [key]: !collapsedGroups.value[key]
  };
};

const selectLayer = (name) => {
  selectedLayerName.value = selectedLayerName.value === name ? null : name;
};


const openLayerEdit = (layerName) => {
  const pois = groupedByLayer.value[layerName] || [];
  const commonColor = pois.length > 0 ? pois[0].color : '';
  const commonIcon = pois.length > 0 ? pois[0].icon : '';

  editingLayerData.value = { 
    originalName: layerName, 
    name: layerName, 
    color: commonColor, 
    icon: commonIcon 
  };
  showLayerEdit.value = true;
};

const saveLayer = (newData) => {
  if (!newData) return;

  if (newData.name !== editingLayerData.value.originalName) {
    const idx = layers.value.indexOf(editingLayerData.value.originalName);
    if (idx !== -1) {
      layers.value[idx] = newData.name;
    }
  }

  mapData.value.saved_poi.forEach(poi => {
    if (poi.layer === editingLayerData.value.originalName) {
      poi.layer = newData.name;
      if (newData.color) poi.color = newData.color;
      if (newData.icon) poi.icon = newData.icon;
      
      updatePoiInMap(props.mapId, poi);
    }
  });

  emit('mapUpdated');
  showLayerEdit.value = false;
};

const openPoiEdit = (poi) => {
  editingPoiData.value = poi;
  showPoiEdit.value = true;
};

const savePoi = (newData) => {
  if (editingPoiData.value) {
    const poi = mapData.value.saved_poi.find(p => p.id === editingPoiData.value.id);
    if (poi) {
      poi.name = newData.name;
      poi.color = newData.color;
      poi.icon = newData.icon;
      poi.must_have = newData.mustHave;
      
      updatePoiInMap(props.mapId, poi); 
      emit('mapUpdated');
    }
  }
};

const openTimelineEdit = (poi) => {
  editingPoiData.value = poi;
  showTimelineEdit.value = true;
};

const saveTimeline = (newDateTime) => {
  if (editingPoiData.value) {
    const poi = mapData.value.saved_poi.find(p => p.id === editingPoiData.value.id);
    if (poi) {
      poi.datetime = newDateTime;
      updatePoiInMap(props.mapId, poi);
      emit('mapUpdated');
    }
  }
};

const requestDeletePoi = (poi) => {
  deletingPoiData.value = poi;
  showDeleteConfirm.value = true;
};

const requestRemovePoiTime = (poi) => {
  removePoiTimeData.value = poi;
  showRemoveTimeConfirm.value = true;
};


const confirmDeletePoi = () => {
  if (deletingPoiData.value) {
    const idx = mapData.value.saved_poi.findIndex(p => p.id === deletingPoiData.value.id);
    if (idx !== -1) {
      mapData.value.saved_poi.splice(idx, 1);
      removePoiFromMap(props.mapId, deletingPoiData.value.id);
      emit('mapUpdated');
    }
    showDeleteConfirm.value = false;
    deletingPoiData.value = null;
  }
};

const confirmRemovePoiTime = () => {
  if (removePoiTimeData.value) {
    const idx = mapData.value.saved_poi.findIndex(p => p.id === removePoiTimeData.value.id);
    if (idx !== -1) {
      mapData.value.saved_poi[idx].datetime = null;
      updatePoiInMap(props.mapId, mapData.value.saved_poi[idx]);
      emit('mapUpdated');
    }
    showRemoveTimeConfirm.value = false;
    removePoiTimeData.value = null;
  }
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
</script>

<template>
  <div>
    <Teleport to="body">
      <LayerEditModal 
        v-if="showLayerEdit"
        :name="editingLayerData.name"
        :color="editingLayerData.color"
        :icon="editingLayerData.icon"
        @save="saveLayer"
        @close="showLayerEdit = false"
      />
      
      <POIEditModal
        v-if="showPoiEdit"
        :name="editingPoiData?.name"
        :color="editingPoiData?.color"
        :icon="editingPoiData?.icon"
        :mustHave="editingPoiData?.must_have"
        @save="savePoi"
        @close="showPoiEdit = false"
      />

      <TimelineEditModal 
        v-if="showTimelineEdit"
        :name="editingPoiData?.name"
        :dateTime="editingPoiData?.datetime || getCurrentLocalISO()"
        @save="saveTimeline"
        @close="showTimelineEdit = false"
      />

      <ConfirmationModal
        v-if="showDeleteConfirm"
        title="Delete POI"
        @confirm="confirmDeletePoi"
        @cancel="showDeleteConfirm = false"
      >
        <p>Are you sure you want to remove <strong>{{ deletingPoiData?.name }}</strong>?</p>
      </ConfirmationModal>

      <ConfirmationModal
        v-if="showRemoveTimeConfirm"
        title="Delete POI Time"
        @confirm="confirmRemovePoiTime"
        @cancel="showRemoveTimeConfirm = false"
      >
        <p>Remove time from <strong>{{ removePoiTimeData?.name }}</strong>?</p>
      </ConfirmationModal>
    </Teleport>

    <button 
      class="fixed left-0 top-1/4 z-50 p-2 bg-white border border-gray rounded-r shadow-md hover:bg-light transition-colors"
      @click="toggleSidebar"
      v-if="!isOpen"
    >
      <i class="bi bi-list-ul text-xl"></i>
    </button>

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
        <span class="text-xs font-bold truncate">{{ touchDragState.poi?.name }}</span>
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
                @click.stop="openLayerEdit(layerName)" 
                class="ml-2 text-gray-400 hover:text-cyan active:text-cyan transition-opacity"
                :class="{ 'opacity-100': selectedLayerName === layerName, 'opacity-0 group-hover:opacity-100': selectedLayerName !== layerName }"
                title="Edit Layer"
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
                    class="bi text-lg" 
                    :class="getIconClass(poi.icon || poi.category.toLowerCase())" 
                    :style="{ color: getColorValue(poi.color) }"
                  ></i>
                  <span class="text-gray-800 text-sm" :class="poi.must_have ? 'font-bold' : ''">{{ poi.name || `POI ${poi.id}` }}</span>
                </div>
                
                <div 
                   class="flex gap-2 transition-opacity"
                   :class="{ 'opacity-100': selectedPoiId === poi.id, 'opacity-0 group-hover:opacity-100': selectedPoiId !== poi.id }"
                >
                  <button @click.stop="openPoiEdit(poi)" class="text-gray hover:text-cyan active:text-cyan" title="Edit POI">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button @click.stop="requestDeletePoi(poi)" class="text-gray hover:text-red active:text-red" title="Remove POI">
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
                  <span 
                    v-if="date !== 'No time selected'"
                    class="text-xs font-mono px-1 py-0.5 text-xl text-darker"
                  >
                    {{ formatTime(poi.datetime) }}
                  </span>
                  <span 
                    v-else
                    class="text-xs font-mono px-1 py-0.5 text-xl text-darker opacity-30"
                  >
                   --:--
                  </span>

                  <i 
                    class="bi text-lg" 
                    :class="getIconClass(poi.icon || poi.category.toLowerCase())" 
                    :style="{ color: getColorValue(poi.color) }"
                  ></i>
                  
                  <div class="flex flex-col overflow-hidden">
                    <span class="text-gray-800 text-sm truncate" :class="poi.must_have ? 'font-bold' : ''">{{ poi.name || `POI ${poi.id}` }}</span>
                  </div>
                </div>

                <div 
                  class="flex gap-2 shrink-0 ml-2 transition-opacity"
                  :class="{ 'opacity-100': selectedPoiId === poi.id, 'opacity-0 group-hover:opacity-100': selectedPoiId !== poi.id }"
                >
                   <button @click.stop="openTimelineEdit(poi)" class="text-gray hover:text-cyan" title="Reschedule">
                    <i class="bi bi-calendar-fill"></i>
                  </button>
                  <button 
                    v-if="date !== 'No time selected'"
                    @click.stop="requestRemovePoiTime(poi)" 
                    class="text-gray hover:text-red" 
                    title="Remove from schedule"
                  >
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