<template>
  <PopupModal title="Edit layer" @close="$emit('close')">
    <div class="space-y-6">
      
      <div>
        <label class="block text-sm text-gray-600 mb-1">Layer Name</label>
        <input 
          v-model="internalName" 
          type="text" 
          class="w-full border-b-2 border-lessdark bg-transparent py-2 focus:border-dark focus:outline-none transition-colors"
          placeholder="Enter layer name"
        />
      </div>

      <ColorPicker 
        v-model="internalColor" 
        label="Color all the layer POIs"
      />

      <IconPicker 
        v-model="internalIcon" 
        label="Set icon for all the layer POIs"
      />

      <div class="mt-8 flex justify-end">
        <button 
          @click="save" 
          class="px-6 py-2 bg-dark text-white rounded hover:bg-darker transition-colors"
        >
          Save Layer
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
  name: "LayerEditModal",
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