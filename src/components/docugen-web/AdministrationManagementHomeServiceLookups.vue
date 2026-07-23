<template>
  <v-card>
    <!-- Title -->
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-cogs"></v-icon>
      </template>
      <v-card-title>Información de servicios</v-card-title>
      <v-card-subtitle>Estado global</v-card-subtitle>
    </v-card-item>
    <!-- Review info -->
    <template v-if="success">
      <v-card-item>
        <v-list density="compact">
          <template v-for="(item, i) in cardInfo" :key="i">
            <v-list-item>
              <div class="d-flex justify-space-between align-center  text-body-2">
                <span class="font-weight-medium text-secondary">{{ item.label }}</span>
                <span class="font-weight-light">
                  <v-chip
                    size="small"
                    :color="item.data === 'running' ? 'success' : 'error'"
                    variant="flat"
                    >{{ item.data === 'running' ? 'Habilitado' : 'Deshabilitado' }}</v-chip
                  >
                </span>
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
import { useServiceLookups } from '../../composables/docugen-web/useServiceLookups.js';
import { useServiceLookupsStore } from '../../stores/docugen-web/serviceLookupsStore.js';

const { actions, loading, success, message, code } = useServiceLookups();
const serviceLookupsStore = useServiceLookupsStore();
const cardInfo = computed(() => {
  return [
    {
      label: 'Servicio de Edición de Plantillas',
      data:
        serviceLookupsStore.getServiceLookupsOverview.find((s) => s.alias === 'edition').status ||
        '',
    },
    {
      label: 'Servicio de Generación de Documentos',
      data:
        serviceLookupsStore.getServiceLookupsOverview.find((s) => s.alias === 'generation')
          .status || '',
    },
  ];
});

onMounted(async () => {
  await actions.serviceLookupsOverviewer();
});
</script>

<style scoped></style>
