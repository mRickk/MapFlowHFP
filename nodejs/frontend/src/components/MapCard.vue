<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { selectMap } from '@/services/userService.js';

interface Props {
  id: number;
  name: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  poiCount: number;
}

const props = defineProps<Props>();
const router = useRouter();

const dateRange = computed(() => `${props.startDate} - ${props.endDate}`);

const durationInDays = computed(() => {
  if (!props.startDate || !props.endDate) return 0;

  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  
  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  return diffInDays;
});

const durationLabel = computed(() => {
  const days = durationInDays.value;
  return days === 1 ? '1 day' : `${days} days`;
});

const handleMapSelection = () => {
  try {
    selectMap(props.id);

    router.push({ name: 'Map' });
  } catch (error) {
    console.error("Errore durante la selezione della mappa:", error);
  }
};
</script>

<template>
  <article
      @click="handleMapSelection"
      class="group relative w-[357px] h-[140px] rounded-[15px] bg-white border border-lesslight font-mono p-3 flex flex-col justify-between overflow-hidden shadow-sm 
             /* Hover effects sulla card */
             hover:shadow-xl hover:-translate-y-1 hover:border-bright/30 transition-all duration-300 ease-out cursor-pointer"
  >
    <div class="flex justify-between items-start w-full mb-1">
      <h3 class="text-dark font-bold text-sm truncate pr-2 group-hover:text-bright transition-colors">
        {{ name }}
      </h3>
      <button @click.stop class="text-gray hover:text-dark transition-colors relative z-10">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
    </div>

    <div class="flex flex-row h-full">
      <div class="w-[130px] h-[85px] overflow-hidden rounded-md shrink-0">
        <img
            :src="imageUrl"
            :alt="name"
            class="w-full h-full object-cover bg-lighter transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div class="flex flex-col justify-between w-full pl-3 h-[85px]">
        <div class="text-xs text-gray leading-tight">
          {{ dateRange }}
        </div>

        <div class="flex justify-between items-end w-full">
          <span class="text-bright font-bold text-lg leading-none transform group-hover:translate-x-1 transition-transform">
            {{ durationLabel }}
          </span>

          <div class="text-bright font-bold text-lg leading-none flex items-center gap-1">
            <span>{{ poiCount }}</span>
            <i class="bi bi-geo-alt-fill text-sm animate-pulse"></i>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>