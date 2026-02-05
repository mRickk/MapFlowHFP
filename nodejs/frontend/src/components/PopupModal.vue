<template>
  <div class="fixed inset-0 z-200 flex items-center justify-center">
    <div 
      class="absolute inset-0 bg-black opacity-50"
      @click="$emit('close')"
    ></div>
    
    <div class="relative z-10 w-11/12 max-w-lg p-6 bg-white text-black rounded shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">{{ title }}</h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 hover:text-black focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PopupModal",
  props: {
    title: {
      type: String,
      required: true
    }
  },
  emits: ['close']
};
</script>

<style scoped>
.z-50 {
  z-index: 50;
}
</style>