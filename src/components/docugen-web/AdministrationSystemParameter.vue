<!-- frontend/src/views/SystemParametersView.vue -->
<template>
  <v-container fluid>
    <template v-if="!loading">
      <!-- Breadcrums -->
      <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4 font-weight-bold">
        <template #divider>
          <v-icon icon="mdi-chevron-right" size="small" />
        </template>
        <template #title="{ item }">
          <span @click="!item.disabled && router.push(item.to)">
            {{ item.title }}
          </span>
        </template>
      </v-breadcrumbs>
      <!-- System Parameter -->
      <AdministrationSystemParameterDatabaseSize
        v-if="systemParameter.name === 'database_size'"
        :systemParameter="systemParameter"
      />
      <AdministrationSystemParameterSystemUptime
        v-if="systemParameter.name === 'system_uptime'"
        :systemParameter="systemParameter"
      />
    </template>
  </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSystemParameter } from '../../composables/docugen-web/useSystemParameter.js';
import AdministrationSystemParameterDatabaseSize from './AdministrationSystemParameterDatabaseSize.vue';
import AdministrationSystemParameterSystemUptime from './AdministrationSystemParameterSystemUptime.vue';

const route = useRoute();
const router = useRouter();
const { systemParameter, actions, loading } = useSystemParameter();
const breadcrumbs = computed(() => [
  {
    title: 'Parámetros del Sistema',
    disabled: false,
    to: '/dashboard/system',
  },
  {
    title: systemParameter.value?.alias ?? '',
    disabled: true,
  },
]);

onMounted(async () => {
  const systemParameterId = route.params.id;
  await actions.systemParameterGetter(systemParameterId);
});
</script>

<style scoped></style>
