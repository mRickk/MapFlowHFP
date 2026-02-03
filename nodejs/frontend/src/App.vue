<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

</script>

<template>
  <div class="flex w-full min-h-screen relative">

    <main class="grow bg-white">
      <router-view />
    </main>

  </div>
</template>