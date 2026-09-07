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
    <v-col cols="8">
      <!-- <AdministrationManagementHomeServices :account="account" />
        -->en construcción
    </v-col>
    <!-- My processes -->
    <v-col cols="4">
      <AdministrationManagementHomeProcesses :account="account" />
    </v-col>
  </v-row>
  <!-- Admin subpanel -->
  <v-row v-if="account.role === 'admin'">
    <v-col cols="4">
      <AdministrationManagementHomeSystemParameters />
    </v-col>
    <v-col cols="4">
      <AdministrationManagementHomeAccounts />
    </v-col>
    <v-col cols="4">
      <AdministrationManagementHomeServiceLookups />
    </v-col>
  </v-row>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useTime } from '../../composables/utils/useTime.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { extractTime } from '../../helpers/utils.js';
import AdministrationManagementHomeProcesses from './AdministrationManagementHomeProcesses.vue';
// import AdministrationManagementHomeServices from './AdministrationManagementHomeServices.vue';
import AdministrationManagementHomeAccounts from './AdministrationManagementHomeAccounts.vue';
import AdministrationManagementHomeSystemParameters from './AdministrationManagementHomeSystemParameters.vue';
import AdministrationManagementHomeServiceLookups from './AdministrationManagementHomeServiceLookups.vue';

const { time, actions: time_actions, loading: time_loading, success: time_success } = useTime();
const myAccountStore = useMyAccountStore();
const account = computed(() => myAccountStore.getMyAccount);

onMounted(async () => {
  await time_actions.serverTimeGetter();
  console.log('El rol del usuario:', account.value.role);
});
</script>

<style scoped></style>
