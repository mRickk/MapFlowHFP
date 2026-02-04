<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  imageUrl: string;
  currentValue: number;
  maxValue: number;
  name?: string;
}

const props = defineProps<Props>();

const progressPercentage = computed(() => {
  if (props.maxValue <= 0) return 100;
  const percent = (props.currentValue / props.maxValue) * 100;
  return Math.min(100, Math.max(0, percent));
});

const isCompleted = computed(() => {
  return props.currentValue >= props.maxValue;
});
</script>

<template>
  <div 
    class="group relative w-full flex flex-col rounded-t-[22px] overflow-hidden shadow-sm border border-black/5
           hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out select-none bg-white h-[200px]"
  >
    
    <div class="relative w-full  overflow-hidden bg-gray-100">
      <img 
        :src="imageUrl" 
        :alt="name || 'Badge'" 
        class="w-full h-full object-cover transition-all duration-500 ease-in-out mt-0"
        :class="isCompleted ? 'grayscale-0' : 'grayscale opacity-70'"
      />
      
      <div v-if="!isCompleted" 
            class="absolute top-3 right-3 text-white bg-black/50 backdrop-blur-md p-2 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        </svg>
        </div>
    </div>

    <div class="w-full p-3 bg-white flex flex-col gap-1.5 h-[70px]">
      
      <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span v-if="isCompleted" class="text-green-600 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          Sbloccato
        </span>
        <span v-else class="text-gray-400">In corso</span>
        
        <span class="text-gray-600 font-mono">{{ currentValue }} / {{ maxValue }}</span>
      </div>

      <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-black/5">
        <div 
          class="h-full transition-all duration-700 ease-out"
          :class="isCompleted ? 'bg-green-500' : 'bg-blue-500'"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      
      <h3 v-if="name" class="text-xs font-semibold text-gray-800 mt-0.5 truncate">
        {{ name }}
      </h3>
    </div>

  </div>
</template>