<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getPOIs } from '@/services/poiService.js';
import { getIconClass, getColorValue } from '@/util/colorIcons.js';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue', 'poi-selected']);

const isOpen = ref(false);
const searchContainer = ref<HTMLElement | null>(null);
const allPois = ref<any[]>([]);

const handleClickOutside = (event: Event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
    allPois.value = getPOIs() || [];
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  isOpen.value = true;
};

const handleFocus = () => {
  allPois.value = getPOIs() || [];
  isOpen.value = true;
};

const filteredPois = computed(() => {
  const query = props.modelValue ? props.modelValue.toLowerCase() : '';
  if (!query) return allPois.value;
  
  return allPois.value.filter(poi => 
    poi.name && poi.name.toLowerCase().includes(query)
  );
});

const selectPoi = (poi: any) => {
  emit('update:modelValue', poi.name);
  emit('poi-selected', poi);
  isOpen.value = false;
};
</script>

<template>
  <div class="relative w-full max-w-md" ref="searchContainer">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <i class="bi bi-search text-gray"></i>
    </div>
    <input
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      type="text"
      placeholder="Search..."
      class="w-full bg-white border border-lesslight rounded-lg pl-10 pr-4 py-2 text-dark font-mono text-sm focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright transition-all placeholder:text-gray/50"
    />
    
    <div 
      v-if="isOpen && filteredPois.length > 0" 
      class="absolute top-full left-0 w-full mt-2 bg-white border border-lesslight rounded-lg shadow-xl max-h-64 overflow-y-auto z-50 py-1"
    >
      <ul>
        <li 
          v-for="poi in filteredPois" 
          :key="poi.id" 
          @click="selectPoi(poi)"
          class="flex items-center px-4 py-2 hover:bg-lesslight/20 cursor-pointer transition-colors border-b border-lesslight/30 last:border-0"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 text-white shadow-sm"
            :style="{ backgroundColor: getColorValue(poi.color) }"
          >
            <i :class="['bi', getIconClass(poi.icon)]"></i>
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-sm font-mono text-dark truncate">{{ poi.name }}</span>
            <span v-if="poi.city" class="text-xs text-gray-500 truncate">({{ poi.city }})</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>