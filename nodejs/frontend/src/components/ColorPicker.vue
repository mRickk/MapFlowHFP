<template>
  <div class="mb-4">
    <label class="block text-sm text-gray-600 mb-2">{{ label }}</label>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="color in colors"
        :key="color"
        type="button"
        class="w-8 h-8 rounded-full border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark"
        :class="{ 'ring-2 ring-offset-2 ring-black': modelValue === color }"
        :style="{ backgroundColor: getColorValue(color) }"
        @click="$emit('update:modelValue', color)"
        :aria-label="color"
      ></button>
    </div>
  </div>
</template>

<script>
import { getColorIds, getColorValue } from '@/util/colorIcons.js';

export default {
  name: "ColorPicker",
  props: {
    modelValue: String,
    label: {
      type: String,
      default: "Select Color"
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      colors: getColorIds()
    };
  },
  methods: {
    getColorValue
  }
};
</script>