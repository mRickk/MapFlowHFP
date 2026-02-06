<template>
  <PopupModal :title="title" @close="$emit('cancel')">
    <div class="text-center">

      <div class="mb-6 text-gray-700">
        <slot></slot>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          @click="$emit('cancel')"
          class="w-full sm:w-auto px-6 py-2 rounded font-semibold bg-brighter text-white shadow-sm hover:bg-brighter transition-colors"
        >
          Cancel
        </button>

        <button
          @click="$emit('confirm')"
          class="w-full sm:w-auto px-6 py-2 rounded font-semibold border-2 border-dark text-dark hover:bg-dark hover:text-white transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  </PopupModal>
</template>

<script>
import PopupModal from './PopupModal.vue';

export default {
  name: "ConfirmationModal",
  components: { PopupModal },
  props: {
    title: {
      type: String,
      required: true
    }
  },
  emits: ['cancel', 'confirm']
};
</script>