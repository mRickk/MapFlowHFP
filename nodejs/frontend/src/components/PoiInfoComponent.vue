<script setup>
const props = defineProps({
  data: { type: Object, required: true },
  isSaved: { type: Boolean, default: false }
});

const emit = defineEmits(['add', 'remove', 'close']);

const toggleAdd = () => {
  if (props.isSaved) {
    emit('remove', props.data);
  } else {
    emit('add', props.data);
  }
};
</script>

<template>
  <div class="relative w-full max-w-md p-4 rounded-lg border border-lesslight bg-white shadow-sm flex justify-between items-start gap-4">
    
    <div class="flex flex-col">
      <h2 class="text-xl font-bold text-dark leading-tight">
        {{ data.name }}
      </h2>
      
      <div class="mt-1 text-sm text-darkgray flex flex-col">
        <span>{{ data.address }}</span>
        <span class="text-xs uppercase tracking-wide text-lessdark">
          {{ data.city }}, {{ data.country }}
        </span>
      </div>
    </div>

    <div class="flex flex-col items-end shrink-0 gap-3">
      <div class="flex items-center gap-2">
        <button 
          @click="toggleAdd" 
          class="cursor-pointer transition-transform active:scale-95 focus:outline-none"
          :title="isSaved ? 'Remove' : 'Add'"
        >
          <svg v-if="isSaved" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-dash-circle-fill text-red" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z"/>
          </svg>

          <svg v-else xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-plus-circle-fill text-green transition-colors" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
          </svg>
        </button>

        <button 
          @click="$emit('close')"
          class="bg-bright border border-lesslight rounded-full p-1 text-black hover:text-red shadow-sm transition-colors cursor-pointer"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-1.5">
        <span class="text-sm font-bold text-darkgray">{{ data.val }}</span>
        
        <div class="flex text-yellow">
          <svg 
            v-for="i in 5" 
            :key="i"
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            fill="currentColor" 
            class="bi bi-star-fill ml-0.5"
            :class="i <= data.val ? 'text-yellow' : 'text-lightergray'"
            viewBox="0 0 16 16"
          >
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
        </div>
      </div>
      </div>
  </div>
</template>