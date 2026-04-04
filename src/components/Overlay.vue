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
    <div class="text-center text-dark">
      <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
      <br />
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
    </div>
  </v-overlay>
</template>

<script setup>
import { useOverlayStore } from '../stores/overlayStore.js';
import { ref, computed, watch } from 'vue';

const overlayStore = useOverlayStore();
const showOverlay = ref(false);
const onReception = computed(() => overlayStore.isOverlaySet);
const title = ref('');
const message = ref('');
const opacity = ref(0.9);
const scrim = ref('white');

const setOverlay = () => {
  title.value = overlayStore.getOverlay.title || '';
  message.value = overlayStore.getOverlay.message || '';
  showOverlay.value = true;
};

const resetOverlay = () => {
  showOverlay.value = false;
};

watch(onReception, (newValue, oldValue) => {
  if (oldValue === false && newValue === true) setOverlay();
  if (oldValue === true && newValue === false) resetOverlay();
});
</script>

<style scoped></style>
