<script setup lang="ts">
import MapCard from '@/components/MapCard.vue';
import { computed, onMounted, onUnmounted, watch, ref, reactive } from 'vue';
import SearchBar from '@/components/SearchBar.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { getUser, addMap, deleteMap, updateMap } from '@/services/userService.js'

interface MapData {
  id: number;
  name: string;
  image_url: string;
  starting_date: string;
  leaving_date: string;
  saved_poi: any[];
}

let maps = ref<MapData[] | null>(null);
const isModalOpen = ref(false);
const showDeleteConfirm = ref(false);
const mapToDeleteId = ref<number | null>(null);

const isEditing = ref(false);
const editingId = ref<number | null>(null);

const newMap = reactive({
  name: '',
  image_url: '',
  starting_date: '',
  leaving_date: ''
});

const searchQuery = ref('');

const filteredMaps = computed(() => {
  if (!maps.value) return [];
  return maps.value.filter(map => 
    map.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(() => {
  maps.value = getUser().maps;
});

const openModal = () => {
  isModalOpen.value = true;
  isEditing.value = false;
  editingId.value = null;
};

const handleEditMap = (id: number) => {
  const mapToEdit = maps.value?.find(m => m.id === id);
  
  if (mapToEdit) {
    newMap.name = mapToEdit.name;
    newMap.image_url = mapToEdit.image_url;
    newMap.starting_date = mapToEdit.starting_date;
    newMap.leaving_date = mapToEdit.leaving_date;
    
    isEditing.value = true;
    editingId.value = id;
    
    isModalOpen.value = true;
  }
};

const handleDeleteMap = (id: number) => {
  mapToDeleteId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDeleteMap = () => {
  if (mapToDeleteId.value) {
    deleteMap(mapToDeleteId.value);
    maps.value = getUser().maps;
  }
  showDeleteConfirm.value = false;
  mapToDeleteId.value = null;
};

const closeModal = () => {
  isModalOpen.value = false;

  newMap.name = '';
  newMap.image_url = '';
  newMap.starting_date = '';
  newMap.leaving_date = '';
  isEditing.value = false;
  editingId.value = null;
};

const handleSave = () => {
  if (!newMap.name || !newMap.starting_date || !newMap.leaving_date) return;

  if (isEditing.value && editingId.value !== null) {
    updateMap(
      editingId.value,
      newMap.name,
      newMap.starting_date,
      newMap.leaving_date,
      newMap.image_url
    );
  } else {
    addMap(
      newMap.name,
      newMap.starting_date,
      newMap.leaving_date,
      newMap.image_url
    );
  }
  maps.value = getUser().maps;

  closeModal();
};

//Avoid background scroll when modal is open
watch(isModalOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <main class="min-h-screen font-mono bg-lighter flex flex-col relative">

    <header class="sticky top-0 z-10 bg-lighter/95 backdrop-blur-sm px-8 pt-8 pb-3 border-b border-gray/10">
      <h1 class="text-dark text-2xl font-bold mb-2">My Maps</h1>
      <p class="text-gray text-sm mb-3">Manage all your maps.</p>

      <SearchBar 
          v-model="searchQuery"
          :show-suggestions="false"
        />
    </header>

    <section class="p-8 pt-4 pb-24 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center md:justify-items-start">
      <MapCard
          v-for="map in filteredMaps"
          :key="map.id"
          :id="map.id"
          :name="map.name"
          :image-url="map.image_url"
          :start-date="map.starting_date"
          :end-date="map.leaving_date"
          :poi-count="map.saved_poi.length"
          @edit="handleEditMap"
          @delete="handleDeleteMap"
      />

      <button 
        @click="openModal"
        class="w-[357px] h-[140px] rounded-[15px] border-2 border-dashed border-green hover:border-bright flex flex-col items-center justify-center text-green hover:text-bright transition-colors group"
      >
        <i class="bi bi-plus-circle-fill text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
        <span class="text-sm font-semibold">Create New Map</span>
      </button>
    </section>

    <ConfirmationModal
      v-if="showDeleteConfirm"
      title="Delete Map"
      @cancel="showDeleteConfirm = false"
      @confirm="confirmDeleteMap"
    >
      <p>Are you sure you want to delete this map? This action cannot be undone.</p>
    </ConfirmationModal>

    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <div class="absolute inset-0 bg-dark/20 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

        <div class="relative bg-white w-full max-w-lg rounded-[15px] shadow-2xl p-6 font-mono border border-lesslight animate-fade-in-up">
          
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-dark">
              {{ isEditing ? 'Edit Adventure' : 'New Adventure' }}
            </h2>
            <button @click="closeModal" class="text-gray hover:text-dark transition-colors">
              <i class="bi bi-x-lg text-lg"></i>
            </button>
          </div>

          <form @submit.prevent="handleSave" class="space-y-4">
            
            <div>
              <label class="block text-xs font-bold text-gray uppercase tracking-wider mb-1">Map Name</label>
              <input 
                v-model="newMap.name"
                type="text" 
                placeholder="e.g. Summer in Tuscany" 
                class="w-full bg-lighter border border-lesslight rounded-md px-3 py-2 text-dark focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray uppercase tracking-wider mb-1">Cover Image URL</label>
              <div class="flex gap-4 items-start">
                <input 
                  v-model="newMap.image_url"
                  type="url" 
                  placeholder="e.g. https://example.com/image.jpg"
                  class="flex-1 bg-lighter border border-lesslight rounded-md px-3 py-2 text-dark focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright transition-all"
                />
                
                <div class="w-16 h-10 rounded-md overflow-hidden border border-lesslight bg-lighter shrink-0">
                  <img 
                    v-if="newMap.image_url" 
                    :src="newMap.image_url" 
                    class="w-full h-full object-cover"
                    alt="Preview"
                    @error="newMap.image_url = ''" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray/30">
                    <i class="bi bi-image"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-4 w-full"> <div class="w-full">
                <label class="block text-xs font-bold text-gray uppercase tracking-wider mb-1">Start Date</label>
                <input 
                  v-model="newMap.starting_date"
                  type="date" 
                  class="w-full min-w-0 bg-lighter border border-lesslight rounded-md px-3 py-2 text-dark focus:outline-none focus:border-bright transition-all"
                  required
                />
              </div>
              <div class="w-full">
                <label class="block text-xs font-bold text-gray uppercase tracking-wider mb-1">End Date</label>
                <input 
                  v-model="newMap.leaving_date"
                  type="date" 
                  class="w-full min-w-0 bg-lighter border border-lesslight rounded-md px-3 py-2 text-dark focus:outline-none focus:border-bright transition-all"
                  required
                />
              </div>
            </div>

            <div class="pt-4 flex justify-end gap-3 border-t border-gray/10 mt-6">
              <button 
                type="button" 
                @click="closeModal"
                class="px-4 py-2 text-sm font-semibold text-gray hover:text-dark transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-6 py-2 bg-brighter text-white text-sm font-bold rounded-lg shadow-md hover:bg-bright/90 hover:-translate-y-0.5 transition-all duration-200"
              >
                {{ isEditing ? 'Update Map' : 'Create Map' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Teleport>

  </main>
</template>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out forwards;
}
</style>