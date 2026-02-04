<template>
  <div class="mb-4">
    <label class="block text-sm text-gray-600 mb-2">{{ label }}</label>
    <div class="grid grid-cols-6 gap-2">
      <button
        v-for="icon in icons"
        :key="icon"
        type="button"
        class="p-2 rounded border border-gray-200 hover:bg-gray-100 flex items-center justify-center transition-colors aspect-square"
        :class="{ 'bg-lesslight border-bright text-dark': modelValue === icon, 'text-gray-500': modelValue !== icon }"
        @click="$emit('update:modelValue', icon)"
        :title="icon"
      >
        <i class="bi text-xl" :class="getIconClass(icon)"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { getIconIds, getIconClass } from '@/util/colorIcons.js';

export default {
  name: "IconPicker",
  props: {
    modelValue: String,
    label: {
      type: String,
      default: "Select Icon"
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      icons: getIconIds()
    };
  },
  methods: {
    getIconClass
  }
};
</script>