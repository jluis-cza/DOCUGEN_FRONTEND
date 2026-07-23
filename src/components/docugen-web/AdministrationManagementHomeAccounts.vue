<template>
  <v-card>
    <!-- Title -->
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-account-multiple"></v-icon>
      </template>
      <v-card-title>Información de cuentas</v-card-title>
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
import { useAccounts } from '../../composables/docugen-web/useAccounts.js';
import { useAccountsStore } from '../../stores/docugen-web/accountsStore.js';

const { actions, loading, success, message, code } = useAccounts();
const accountsStore = useAccountsStore();
const cardInfo = computed(() => {
  return [
    { label: 'Totales', data: accountsStore.getAccountsOverview.total.toString() || '' },
    { label: 'Activas', data: accountsStore.getAccountsOverview.active.toString() || '' },
    { label: 'Suspendidas', data: accountsStore.getAccountsOverview.suspended.toString() || '' },
    { label: 'Inactivas', data: accountsStore.getAccountsOverview.inactive.toString() || '' },
    {
      label: 'Administrativas',
      data: accountsStore.getAccountsOverview.administrator.toString() || '',
    },
    { label: 'Clientes', data: accountsStore.getAccountsOverview.developer.toString() || '' },
  ];
});

onMounted(async () => {
  await actions.accountsOverviewer();
});
</script>

<style scoped></style>
