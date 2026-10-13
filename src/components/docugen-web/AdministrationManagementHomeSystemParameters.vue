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
  const overview = systemParametersStore.getSystemParametersOverview;
  const dbUsedValue = overview.dbUsedSize?.value;
  const dbTotalValue = overview.dbTotalSize?.value;
  const dbUsedText =
    dbUsedValue !== null && dbUsedValue !== undefined ? `${dbUsedValue}[${overview.dbUsedSize.unit}]` : 'No disponible';
  const dbTotalText =
    dbTotalValue !== null && dbTotalValue !== undefined
      ? `${dbTotalValue}[${overview.dbTotalSize.unit}]`
      : 'No disponible';
  const uptimeText =
    overview.systemUptime?.value !== null && overview.systemUptime?.value !== undefined
      ? `${overview.systemUptime.value}[${overview.systemUptime.unit}]`
      : 'No disponible';

  return [
    {
      label: 'Nombre del servidor',
      data: overview.hostname || '',
    },
    {
      label: 'Nombre de la base de datos',
      data: overview.dbName || '',
    },
    {
      label: 'Almacenamiento de la base de datos',
      data: `${dbUsedText} usados de ${dbTotalText}`,
    },
    {
      label: 'Plataforma del servidor',
      data: overview.platform || '',
    },
    {
      label: 'Tiempo de operación del servidor',
      data: uptimeText,
    },
    // { label: 'IP del servidor', data: '' },
  ];
});

onMounted(async () => {
  await actions.systemParametersOverviewer();
});
</script>

<style scoped></style>
