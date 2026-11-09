<template>
  <!-- Current date -->
  <v-row>
    <v-col class="d-flex align-center justify-end" cols="12">
      <div class="text-h6 font-weight-light">
        {{ extractTime(time, 'America/La_Paz', 'long').date }}
      </div>
    </v-col>
  </v-row>

  <v-row>
    <!-- Services overview -->
    <v-col cols="12" lg="8">
      <AdministrationManagementHomeServices :account="account" />
    </v-col>
    <!-- My processes -->
    <v-col cols="12" lg="4">
      <AdministrationManagementHomeProcesses :account="account" />
    </v-col>
  </v-row>

  <v-row v-if="account.role === 'dev'">
    <v-col cols="12">
      <v-card>
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-information-outline"></v-icon>
          </template>
          <v-card-title>Información de servicios</v-card-title>
        </v-card-item>

        <v-divider></v-divider>

        <v-card-item>
          <v-list density="compact" class="bg-transparent">
            <v-list-item v-for="(item, index) in serviceInfo" :key="index">
              <div class="d-flex justify-space-between align-center w-100">
                <span>{{ item.label }}</span>
                <v-chip
                  size="small"
                  :color="
                    item.status === 'running'
                      ? 'success'
                      : item.status === 'stopped'
                        ? 'error'
                        : 'secondary'
                  "
                  variant="flat"
                >
                  {{
                    item.status === 'running'
                      ? 'Habilitado'
                      : item.status === 'stopped'
                        ? 'Deshabilitado'
                        : 'Cargando...'
                  }}
                </v-chip>
              </div>
            </v-list-item>
          </v-list>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>

  <!-- Admin subpanel -->
  <v-row v-if="account.role === 'admin'">
    <v-col cols="12" sm="6" lg="4">
      <AdministrationManagementHomeSystemParameters />
    </v-col>
    <v-col cols="12" sm="6" lg="4">
      <AdministrationManagementHomeAccounts />
    </v-col>
    <v-col cols="12" sm="6" lg="4">
      <AdministrationManagementHomeServiceLookups />
    </v-col>
  </v-row>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useTime } from '../../composables/utils/useTime.js';
import { useServiceLookups } from '../../composables/docugen-web/useServiceLookups.js';
import { useServiceLookupsStore } from '../../stores/docugen-web/serviceLookupsStore.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { ConfigurationService } from '../../services/docugen-app/ConfigurationService.js';
import { extractTime } from '../../helpers/utils.js';
import AdministrationManagementHomeProcesses from './AdministrationManagementHomeProcesses.vue';
import AdministrationManagementHomeServices from './AdministrationManagementHomeServices.vue';
import AdministrationManagementHomeAccounts from './AdministrationManagementHomeAccounts.vue';
import AdministrationManagementHomeSystemParameters from './AdministrationManagementHomeSystemParameters.vue';
import AdministrationManagementHomeServiceLookups from './AdministrationManagementHomeServiceLookups.vue';

const { time, actions: time_actions, loading: time_loading, success: time_success } = useTime();
const { actions: serviceLookupsActions } = useServiceLookups();
const serviceLookupsStore = useServiceLookupsStore();
const myAccountStore = useMyAccountStore();
const account = computed(() => myAccountStore.getMyAccount);
const serviceState = ref({
  edition: null,
  generation: null,
});

const serviceInfo = computed(() => {
  return [
    {
      label: 'Servicio de Edición de Plantillas',
      status: serviceState.value.edition,
    },
    {
      label: 'Servicio de Generación de Documentos',
      status: serviceState.value.generation,
    },
  ];
});

onMounted(async () => {
  await time_actions.serverTimeGetter();

  if (account.value.role === 'admin') {
    await serviceLookupsActions.serviceLookupsOverviewer();
  }

  if (account.value.role === 'dev') {
    try {
      const response = await ConfigurationService.getAccountServicesAvailability();
      const data = response?.data?.data || {};
      const editionEnabled = Boolean(data?.services?.edition?.enabled);
      const generationEnabled = Boolean(data?.services?.generation?.enabled);

      serviceState.value = {
        edition: editionEnabled ? 'running' : 'stopped',
        generation: generationEnabled ? 'running' : 'stopped',
      };
    } catch (error) {
      console.error('No se pudo recuperar la disponibilidad de servicios del usuario.', error);
    }
  }
});
</script>

<style scoped></style>
