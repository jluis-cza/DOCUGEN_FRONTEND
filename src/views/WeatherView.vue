<template>La temperatura en la pzz es: {{ weather.temperature }} °c</template>

<script setup>
import { useWeatherComposable } from '../composables/weatherComposable';
import { onMounted } from 'vue';
import { useWeatherStore } from '../stores/weatherStore';

const weather = useWeatherStore();

onMounted(() => {
  useWeatherComposable();
});
</script>

<style scoped></style>
