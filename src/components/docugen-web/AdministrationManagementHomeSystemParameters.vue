<template>
  <v-card>
    <!-- Title -->
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-cog-outline"></v-icon>
      </template>
      <v-card-title>Información del sistema</v-card-title>
      <v-card-subtitle>Resumen general</v-card-subtitle>
    </v-card-item>
    <!-- Review info -->
    <template v-if="success">
      <v-card-item>
        <v-list density="compact">
          <template v-for="(item, i) in cardInfo" :key="i">
            <v-list-item>
              <div class="d-flex justify-space-between align-center text-body-2">
                <span class="font-weight-medium text-secondary">{{ item.label }}</span>
                <span class="font-weight-light">{{ item.data }}</span>
              </div>
            </v-list-item>
            <v-divider></v-divider>
          </template>
        </v-list>
      </v-card-item>
    </template>
  </v-card>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useSystemParametersStore } from '../../stores/docugen-web/systemParametersStore.js';
import { useSystemParameters } from '../../composables/docugen-web/useSystemParameters.js';

const systemParametersStore = useSystemParametersStore();
const { actions, loading, success, message, code } = useSystemParameters();

const cardInfo = computed(() => {
  return [
    {
      label: 'Nombre del servidor',
      data: systemParametersStore.getSystemParametersOverview.hostname || '',
    },
    {
      label: 'Nombre de la base de datos',
      data: systemParametersStore.getSystemParametersOverview.dbName || '',
    },
    {
      label: 'Almacenamiento de la base de datos',
      data:
        systemParametersStore.getSystemParametersOverview.dbUsedSize.value +
          '[' +
          systemParametersStore.getSystemParametersOverview.dbUsedSize.unit +
          ']' +
          ' usados de ' +
          systemParametersStore.getSystemParametersOverview.dbTotalSize.value +
          '[' +
          systemParametersStore.getSystemParametersOverview.dbTotalSize.unit +
          ']' || '',
    },
    {
      label: 'Plataforma del servidor',
      data: systemParametersStore.getSystemParametersOverview.platform || '',
    },
    {
      label: 'Tiempo de operación del servidor',
      data:
        systemParametersStore.getSystemParametersOverview.systemUptime.value +
          '[' +
          systemParametersStore.getSystemParametersOverview.systemUptime.unit +
          ']' || '',
    },
    // { label: 'IP del servidor', data: '' },
  ];
});

onMounted(async () => {
  await actions.systemParametersOverviewer();
});
</script>

<style scoped></style>
