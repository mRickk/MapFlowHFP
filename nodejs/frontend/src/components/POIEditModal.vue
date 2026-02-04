<template>
  <PopupModal title="Edit POI" @close="$emit('close')">
    <div class="space-y-6">

      <div>
        <label class="block text-sm text-gray-600 mb-1">POI Name</label>
        <input 
          v-model="internalName" 
          type="text" 
          class="w-full border-b-2 border-lessdark bg-transparent py-2 focus:border-dark focus:outline-none transition-colors"
          placeholder="Enter POI name"
        />
      </div>

      <ColorPicker 
        v-model="internalColor" 
        label="Marker Color"
      />

      <IconPicker 
        v-model="internalIcon" 
        label="Marker Icon"
      />

      <div class="mt-8 flex justify-end">
        <button 
          @click="save" 
          class="px-6 py-2 bg-dark text-white rounded hover:bg-darker transition-colors"
        >
          Save POI
        </button>
      </div>
    </div>
  </PopupModal>
</template>

<script>
import PopupModal from './PopupModal.vue';
import ColorPicker from './ColorPicker.vue';
import IconPicker from './IconPicker.vue';

export default {
  name: "POIEditModal",
  components: { PopupModal, ColorPicker, IconPicker },
  props: {
    name: String,
    color: String,
    icon: String,
  },
  emits: ['close', 'save'],
  data() {
    return {
      internalName: this.name || '',
      internalColor: this.color || '',
      internalIcon: this.icon || ''
    };
  },
  methods: {
    save() {
      this.$emit('save', {
        name: this.internalName,
        color: this.internalColor,
        icon: this.internalIcon
      });
      this.$emit('close');
    }
  }
};
</script>