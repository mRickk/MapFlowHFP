<template>
  <PopupModal title="Insert POI" @close="$emit('close')">
    <div class="space-y-6">
      
      <div>
        <label class="block text-sm text-gray-600 mb-1">POI Title <span class="text-red-500">*</span></label>
        <input 
          v-model="poiName" 
          type="text" 
          class="w-full border-b-2 border-lessdark bg-transparent py-2 focus:border-dark focus:outline-none transition-colors"
          :class="{'border-red-500': showError && !poiName}"
          placeholder="Enter POI title"
        />
        <p v-if="showError && !poiName" class="text-red-500 text-xs mt-1">Title is required</p>
      </div>

      <div class="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="mustHaveCheckbox" 
          v-model="mustHave"
          class="w-4 h-4 text-dark bg-gray-100 border-gray-300 rounded focus:ring-dark focus:ring-2"
        >
        <label for="mustHaveCheckbox" class="text-sm font-medium text-gray-900 select-none cursor-pointer">Must Have</label>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">Layer <span class="text-red-500">*</span></label>
        <select 
          v-model="selectedLayer" 
          class="w-full border-b-2 border-lessdark bg-transparent py-2 focus:border-dark focus:outline-none transition-colors"
          :class="{'border-red-500': showError && !selectedLayer}"
        >
          <option value="" disabled>Select a layer</option>
          <option v-for="layer in layers" :key="layer" :value="layer">
            {{ layer }}
          </option>
        </select>
        <p v-if="showError && !selectedLayer" class="text-red-500 text-xs mt-1">Layer is required</p>
      </div>

      <IconPicker 
        v-model="selectedIcon" 
        label="Marker Icon"
      />

      <ColorPicker 
        v-model="selectedColor" 
        label="Marker Color"
      />

      <div class="mt-8 flex justify-end gap-3">
        <button 
          @click="$emit('close')" 
          class="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleCreate" 
          class="px-6 py-2 bg-dark text-white rounded hover:bg-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!poiName || !selectedLayer"
        >
          Create
        </button>
      </div>
    </div>
  </PopupModal>
</template>

<script setup>
import { ref } from 'vue';
import PopupModal from './PopupModal.vue';
import ColorPicker from './ColorPicker.vue';
import IconPicker from './IconPicker.vue';

const props = defineProps({
  layers: {
    type: Array,
    default: () => []
  },
  initialName: {
    type: String,
    default: ''
  },
  initialIcon: {
    type: String,
    default: 'pin'
  },
  initialColor: {
    type: String,
    default: 'red'
  }
});

const emit = defineEmits(['close', 'create']);

const poiName = ref(props.initialName);
const selectedLayer = ref('');
const selectedIcon = ref(props.initialIcon); 
const selectedColor = ref(props.initialColor); 
const mustHave = ref(false);
const showError = ref(false);

const handleCreate = () => {
    if (!poiName.value || !selectedLayer.value) {
        showError.value = true;
        return;
    }
    
    emit('create', {
        name: poiName.value,
        layer: selectedLayer.value,
        icon: selectedIcon.value || 'pin',
        color: selectedColor.value || 'red',
        must_have: mustHave.value
    });
};
</script>
