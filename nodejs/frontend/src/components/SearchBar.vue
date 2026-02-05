<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue']);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit('update:modelValue', value);
};
</script>

<template>
  <div class="relative w-full max-w-md">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <i class="bi bi-search text-gray"></i>
    </div>
    <input
      :value="modelValue"
      @input="handleInput"
      type="text"
      placeholder="Search..."
      class="w-full bg-white border border-lesslight rounded-lg pl-10 pr-4 py-2 text-dark font-mono text-sm focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright transition-all placeholder:text-gray/50"
    />
  </div>
</template>