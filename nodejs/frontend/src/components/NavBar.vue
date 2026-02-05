<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const menuItems = [
  { name: 'Inspiration', path: '/inspiration', icon: 'bi-stars', metaKey: 'inspiration' },
  { name: 'Map', path: '/map', icon: 'bi-map-fill', metaKey: 'map' },
  { name: 'My Maps', path: '/my-maps', icon: 'bi-globe-americas-fill', metaKey: 'my-maps' },
  { name: 'Profile', path: '/profile', icon: 'bi-person-fill', metaKey: 'profile' },
];

const isActive = (metaKey) => {
  return route.meta?.activeMenu === metaKey;
};
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
    <div class="pointer-events-auto bg-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] h-20 flex justify-between items-center px-8 pb-1">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="relative flex flex-col items-center justify-center w-12 h-full text-dark group"
      >
        <div
          class="absolute flex items-center justify-center transition-all duration-300 ease-in-out rounded-full"
          :class="[
            isActive(item.metaKey)
              ? 'bg-brighter w-14 h-14 -top-6 border-[5px] border-white shadow-lg'
              : 'bg-transparent w-auto h-auto top-1/2 -translate-y-1/2'
          ]"
        >
          <i
            :class="[
              item.icon,
              'transition-all duration-300',
              isActive(item.metaKey) ? 'text-white text-2xl scale-110' : 'text-dark text-2xl'
            ]"
          ></i>
        </div>
        <span
          class="text-[10px] font-bold mt-auto mb-3 transition-all duration-300 absolute bottom-0"
          :class="[
            isActive(item.metaKey)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          ]"
        >
          {{ item.name }}
        </span>
      </router-link>
    </div>
  </nav>
</template>