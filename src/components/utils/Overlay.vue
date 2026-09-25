<template>
  <v-overlay
    v-model="showOverlay"
    scroll-strategy="block"
    z-index="9999"
    class="align-center justify-center"
    :opacity="opacity"
    :scrim="scrim"
    contained
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
