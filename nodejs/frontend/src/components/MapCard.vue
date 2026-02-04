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
  duration: string;
  poiCount: number;
}

const props = defineProps<Props>();
const router = useRouter();

const dateRange = computed(() => `${props.startDate} - ${props.endDate}`);

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
      class="group relative w-[357px] h-[140px] rounded-[15px] bg-white border border-lesslight font-mono p-3 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex justify-between items-start w-full mb-1">
      <h3 class="text-dark font-bold text-sm truncate pr-2">
        {{ name }}
      </h3>
      <button @click.stop class="text-gray hover:text-dark transition-colors">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
    </div>

    <div class="flex flex-row h-full">
      <img
          :src="imageUrl"
          :alt="name"
          class="w-[130px] h-[85px] object-cover rounded-md bg-lighter shrink-0"
      />

      <div class="flex flex-col justify-between w-full pl-3 h-[85px]">

        <div class="text-xs text-gray leading-tight">
          {{ dateRange }}
        </div>

        <div class="flex justify-between items-end w-full">

          <span class="text-bright font-bold text-lg leading-none">
            {{ duration }}
          </span>

          <div class="text-bright font-bold text-lg leading-none flex items-center gap-1">
            <span>{{ poiCount }}</span>
            <i class="bi bi-geo-alt-fill text-sm"></i>
          </div>

        </div>
      </div>
    </div>
  </article>
</template>