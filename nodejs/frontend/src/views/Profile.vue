<script setup>
import { ref, onMounted } from 'vue';
import { getUser } from '../services/userService';
import { getPOI } from '../services/poiService';

import BadgeCard from '@/components/BadgeCard.vue';
import country_10 from '@/assets/images/country_10.jpeg';
import country_100 from '@/assets/images/country_100.jpeg';
import maps_10 from '@/assets/images/maps_10.jpeg';
import maps_100 from '@/assets/images/maps_100.jpeg';
import museum_100 from '@/assets/images/museum_100.jpeg';
import parks_100 from '@/assets/images/parks_100.jpeg';

const badges = ref([]);
const user = ref(null);
onMounted(() => {
  user.value = getUser();
  const map_number = user.value.maps.length;
  const poi_selected_ids = [...new Set(user.value.maps.flatMap(m => m.saved_poi).map(saved => saved.id))];

  const country_number = [...new Set(poi_selected_ids.map(id => getPOI(id).country.toLowerCase()))].length;
  const museum_number = poi_selected_ids.map(id => getPOI(id)).filter(poi => poi.category.toLowerCase() === 'museum').length;
  const parks_number = poi_selected_ids.map(id => getPOI(id)).filter(poi => poi.category.toLowerCase() === 'park').length;
  
  badges.value = [
    { image: country_10, val: country_number, total: 10 },
    { image: country_100, val: country_number, total: 100 },
    { image: maps_10, val: map_number, total: 10 },
    { image: maps_100, val: map_number, total: 100 },
    { image: museum_100, val: museum_number, total: 100 },
    { image: parks_100, val: parks_number, total: 100 },
    ];
});
</script>

<template>
  <main class="min-h-screen font-mono bg-lighter flex flex-col relative">

    <header class="sticky top-0 z-10 bg-lighter/95 backdrop-blur-sm px-8 pt-8 pb-4 border-b border-gray/10">
      <h1 class="text-dark text-2xl font-bold mb-2">My Profile</h1>
      <p v-if="user" class="text-gray text-sm">{{user.first_name}} {{user.last_name}}</p>
    </header>

    <section class="p-6 md:p-8">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
        
        <BadgeCard 
            v-for="badge in badges" 
            :key="badge.id" 
            :imageUrl="badge.image"
            :currentValue="badge.val"
            :maxValue="badge.total"
        />

      </div>
    </section>

  </main>
</template>