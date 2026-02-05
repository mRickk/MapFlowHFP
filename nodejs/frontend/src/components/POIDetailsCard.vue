<script setup>
import { ref, watch } from 'vue';
import PoiInfoComponent from '@/components/PoiInfoComponent.vue';

const props = defineProps({
  poi: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  },
  
  onAdd: { type: Function, default: () => {} },
  onRemove: { type: Function, default: () => {} }
});

const emit = defineEmits(['close']);

const cardHeight = ref(350);
const isDragging = ref(false);
const startY = ref(0);
const startHeight = ref(0);

watch(() => props.visible, (newVal) => {
    if (newVal) {
        cardHeight.value = 350;
    }
});

const startDrag = (e) => {
    isDragging.value = true;
    startY.value = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    startHeight.value = cardHeight.value;
    
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('touchend', endDrag);
};

const onDrag = (e) => {
    if (!isDragging.value) return;
    
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const delta = startY.value - clientY;
    const maxHeight = window.innerHeight * 0.9;
    const newHeight = startHeight.value + delta;
    
    cardHeight.value = Math.max(100, Math.min(maxHeight, newHeight));
};

const endDrag = () => {
    isDragging.value = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', endDrag);

    if (cardHeight.value < 200) {
        emit('close');
    } else if (cardHeight.value > window.innerHeight * 0.7) {
        cardHeight.value = window.innerHeight * 0.8;
    } else {
        cardHeight.value = 350;
    }
};
</script>

<template>
<transition name="slide-up">
    <div 
        v-if="visible"
        class="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-[100] flex flex-col overflow-hidden"
        :class="{ 'transition-height duration-300 ease-out': !isDragging }"
        :style="{ height: cardHeight + 'px' }"
    >
        <div 
            class="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing touch-none shrink-0"
            @mousedown="startDrag"
            @touchstart="startDrag"
        >
            <div class="w-16 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div class="flex-1 overflow-y-auto pb-6 space-y-6">
            <PoiInfoComponent 
                v-if="poi" 
                :data="poi" 
                :onAdd="onAdd"
                :onRemove="onRemove"
                :onClose="() => emit('close')" 
            />

            <div v-if="poi && poi.images_url && poi.images_url.length > 0" class="flex flex-col gap-4 px-2">
                <div 
                    v-for="(img, index) in poi.images_url" 
                    :key="index"
                    class="w-full h-50 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100"
                >
                    <img 
                        :src="img" 
                        alt="Location Photo" 
                        class="w-full h-full object-cover"
                    >
                </div>
            </div>
        </div>
    </div>
</transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>