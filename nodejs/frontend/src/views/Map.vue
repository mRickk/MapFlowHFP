<script setup>
import SelectedLegend from '@/components/SelectedLegend.vue';
import { getUser } from '@/services/userService.js';
</script>

<template>
 Map
 <SelectedLegend :mapId="getUser().maps.find(map => map.selected).id" />
</template>