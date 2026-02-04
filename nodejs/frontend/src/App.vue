<script setup>
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';

const route = useRoute();

</script>

<template>
  <div class="flex w-full min-h-screen relative">

    <NavBar />

    <main class="grow bg-white pb-24">
      <router-view />
    </main>

  </div>
</template>