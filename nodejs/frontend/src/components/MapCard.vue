<script setup lang="ts">
import { computed, ref } from 'vue';
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
const emit = defineEmits(['edit', 'delete']); 
const router = useRouter();

const isMenuOpen = ref(false);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const dateRange = computed(() => {
  return `${formatDate(props.startDate)} - ${formatDate(props.endDate)}`;
});

const durationInDays = computed(() => {
  if (!props.startDate || !props.endDate) return 0;
  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  const diffInMs = end.getTime() - start.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
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
    console.error("Error selecting map:", error);
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const onEdit = () => {
  emit('edit', props.id);
  isMenuOpen.value = false;
};

const onDelete = () => {
  emit('delete', props.id);
  isMenuOpen.value = false;
};
</script>

<template>
  <article
      @click="handleMapSelection"
      class="group relative w-[357px] h-[145px] rounded-[15px] bg-white border border-lesslight font-mono p-3 flex flex-col justify-between overflow-hidden shadow-sm 
             hover:shadow-xl hover:-translate-y-1 hover:border-bright/30 transition-all duration-300 ease-out cursor-pointer"
  >
    <div class="flex justify-between items-start w-full mb-1 relative"> <h3 class="text-dark font-bold text-sm truncate pr-2 group-hover:text-bright transition-colors">
        {{ name }}
      </h3>
      
      <button 
        @click.stop="toggleMenu" 
        class="text-gray hover:text-dark transition-colors relative z-5 p-1 rounded-full hover:bg-lighter"
      >
        <i class="bi bi-three-dots-vertical"></i>
      </button>

      <div 
        v-if="isMenuOpen" 
        @click.stop
        class="absolute top-6 right-0 bg-white border border-lesslight shadow-lg rounded-md z-20 w-32 flex flex-col py-1 animate-fade-in-down"
      >
        <button 
          @click="onEdit" 
          class="text-left px-4 py-2 text-xs text-dark hover:bg-lighter hover:text-bright transition-colors flex items-center gap-2"
        >
          <i class="bi bi-pencil"></i> Edit
        </button>
        <button 
          @click="onDelete" 
          class="text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
        >
          <i class="bi bi-trash"></i> Delete
        </button>
      </div>

      <div v-if="isMenuOpen" @click.stop="isMenuOpen = false" class="fixed inset-0 z-10 cursor-default"></div>
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

<style scoped>
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fade-in-down 0.2s ease-out forwards;
}
</style>