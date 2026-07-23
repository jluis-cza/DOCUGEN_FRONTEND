<template>
  <v-container fluid>
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
    <!-- Service Lookup info -->
    <v-card>
      <!-- Title -->
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-toolbox-outline"></v-icon>
        </template>
        <v-card-title> {{ serviceLookup?.name || '' }}</v-card-title>
      </v-card-item>
      <!-- Review info -->
      <v-card-item>
        <v-list density="compact">
          <template v-for="(item, i) in cardInfo" :key="i">
            <v-list-item>
              <div class="d-flex justify-space-between align-center">
                <span class="font-weight-medium text-secondary">{{ item.label }}</span>
                <span class="font-weight-light text-right">
                  <template v-if="item.label === 'Estado'">
                    <v-chip size="small" :color="item.data[1]" variant="flat">{{
                      item.data[0]
                    }}</v-chip>
                  </template>
                  <template v-else>
                    {{ item.data }}
                  </template>
                </span>
              </div>
            </v-list-item>
            <v-divider></v-divider>
          </template>
        </v-list>
      </v-card-item>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServiceLookup } from '../../composables/docugen-web/useServiceLookup.js';
import { extractTime } from '../../helpers/utils.js';

const route = useRoute();
const router = useRouter();
const serviceLookupId = ref('');
const { serviceLookup, actions, loading } = useServiceLookup();

const breadcrumbs = computed(() => [
  {
    title: 'Servicios',
    disabled: false,
    to: '/dashboard/services',
  },
  {
    title:
      (serviceLookup.value?.alias ?? '' === 'generation')
        ? 'Generación'
        : (serviceLookup.value?.alias ?? '' === 'edition')
          ? 'Edición'
          : '',
    disabled: true,
  },
]);

// Review info
const status = (itemStatus) => {
  return {
    color: itemStatus === 'running' ? 'success' : itemStatus === 'stopped' ? 'error' : 'info',
    text:
      itemStatus === 'running'
        ? 'En servicio'
        : itemStatus === 'stopped'
          ? 'Fuera de servicio'
          : 'Sin estado',
  };
};
const cardInfo = computed(() => {
  return [
    { label: 'Descripción', data: serviceLookup.value?.description || '' },
    {
      label: 'Estado',
      data: [status(serviceLookup.value?.status).text, status(serviceLookup.value?.status).color],
    },
    {
      label: 'Fecha de creación',
      data: `${extractTime(serviceLookup.value?.createdAt, 'America/La_Paz', 'long').date} - ${extractTime(serviceLookup.value?.createdAt, 'America/La_Paz', 'long').hour}`,
    },
    {
      label: 'Fecha de actualización',
      data: `${extractTime(serviceLookup.value?.updatedAt, 'America/La_Paz', 'long').date} - ${extractTime(serviceLookup.value?.updatedAt, 'America/La_Paz', 'long').hour}`,
    },
  ];
});

onMounted(async () => {
  serviceLookupId.value = route.params.serviceId;
  await actions.serviceLookupGetter(serviceLookupId.value);
});
</script>

<style scoped></style>
