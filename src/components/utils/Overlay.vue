<template>
  <v-overlay
    v-model="showOverlay"
    scroll-strategy="block"
    z-index="9999"
    :opacity="opacity"
    :scrim="scrim"
    :content-props="centeredSpinnerProps"
    persistent
  >
    <v-progress-circular color="primary" size="48" indeterminate />
  </v-overlay>
</template>

<script setup>
import { useOverlayStore } from '../../stores/utils/overlayStore.js';
import { ref, computed, watch } from 'vue';

const overlayStore = useOverlayStore();
const showOverlay = ref(false);
const onReception = computed(() => overlayStore.isOverlaySet);
const opacity = ref(0.9);
const scrim = ref('white');
const centeredSpinnerProps = {
  style: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};

const setOverlay = () => {
  showOverlay.value = true;
};

const resetOverlay = () => {
  showOverlay.value = false;
};

watch(
  onReception,
  (newValue, oldValue) => {
    if (oldValue === false && newValue === true) setOverlay();
    if (oldValue === true && newValue === false) resetOverlay();
  },
  {
    immediate: true,
  }
);
</script>

<style scoped></style>
