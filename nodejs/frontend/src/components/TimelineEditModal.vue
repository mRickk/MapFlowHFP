<template>
  <PopupModal title="Edit POI time" @close="$emit('close')">
    <div class="space-y-6">
      
      <div>
        <label class="block text-sm text-gray-600 mb-1">POI Name</label>
        <div class="w-full border-b border-gray-300 py-2 text-dark font-medium">
          {{ name }}
        </div>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">Date and Time</label>
        <input 
          v-model="internalDateTime" 
          type="datetime-local" 
          class="w-full p-2 border border-lessdark rounded focus:ring-2 focus:ring-bright focus:border-bright bg-white text-black"
        />
      </div>

      <div class="mt-8 flex justify-end">
        <button 
          @click="save" 
          class="px-6 py-2 bg-dark text-white rounded hover:bg-darker transition-colors"
        >
          Update Time
        </button>
      </div>
    </div>
  </PopupModal>
</template>

<script>
import PopupModal from './PopupModal.vue';

export default {
  name: "TimelineEditModal",
  components: { PopupModal },
  props: {
    name: {
      type: String,
      default: "Unnamed POI"
    },
    dateTime: String
  },
  emits: ['close', 'save'],
  data() {
    return {
      internalDateTime: this.dateTime || ''
    };
  },
  methods: {
    save() {
      this.$emit('save', this.internalDateTime);
      this.$emit('close');
    }
  }
};
</script>