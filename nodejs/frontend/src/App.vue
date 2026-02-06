<script setup>
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';

const route = useRoute();

</script>

<template>
  <div class="flex w-full h-screen relative overflow-hidden">

    <NavBar />

    <main class="grow bg-lighter/95 pb-24 overflow-y-auto w-full relative">
      <router-view />
    </main>

  </div>
</template>