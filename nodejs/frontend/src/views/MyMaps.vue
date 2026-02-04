<script setup lang="ts">
import MapCard from '@/components/MapCard.vue';
import { onMounted, ref } from 'vue';

import { getUser } from '@/services/userService.js'

let maps = ref(null);

onMounted(() => {
  maps.value = getUser().maps;
});
</script>

<template>
  <main class="min-h-screen font-mono bg-lighter flex flex-col">

    <header class="sticky top-0 z-10 bg-lighter/95 backdrop-blur-sm p-8 border-b border-gray/10">
      <h1 class="text-dark text-2xl font-bold mb-2">My Maps</h1>
      <p class="text-gray text-sm">Manage all your maps.</p>
    </header>

    <section class="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center md:justify-items-start">
      <MapCard
          v-for="map in maps"
          :key="map.id"
          :id="map.id"
          :name="map.name"
          :image-url="map.image_url"
          :start-date="map.starting_date"
          :end-date="map.leaving_date"
          :poi-count="map.saved_poi.length"
      />

      <button class="w-[357px] h-[140px] rounded-[15px] border-2 border-dashed border-lesslight hover:border-bright flex flex-col items-center justify-center text-gray hover:text-bright transition-colors group">
        <i class="bi bi-plus-circle-fill text-2xl mb-2 group-hover:scale-110 transition-transform"></i>
        <span class="text-sm font-semibold">Create New Map</span>
      </button>
    </section>

  </main>
</template>