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
    <!-- title -->
    <div class="text-left">
      <h3>Sesiones</h3>
    </div>
    <!-- table -->
    <div class="my-4">
      <v-card>
        <v-data-table-server
          :items-per-page="params.limit"
          :page="params.page"
          :headers="headers"
          :items="sessions"
          :items-length="table?.pagination?.total || 1"
          :loading="sessions_loading"
          @update:options="handleTableUpdate"
          :items-per-page-options="[5, 10, 25, 50]"
        >
          <template #[`item.loginTime`]="{ item }">
            {{ extractTime(item.loginTime, 'America/La_Paz', 'short').date }} -
            {{ extractTime(item.loginTime, 'America/La_Paz', 'short').hour }}
          </template>
          <template #[`item.logoutTime`]="{ item }">
            {{ extractTime(item.logoutTime, 'America/La_Paz', 'short').date }} -
            {{ extractTime(item.logoutTime, 'America/La_Paz', 'short').hour }}
          </template>
          <template #[`item.status`]="{ item }">
            <v-chip :color="status(item.status).color" variant="flat" size="small">{{
              status(item.status).text
            }}</v-chip>
          </template>
        </v-data-table-server>
      </v-card>
    </div>
    <!-- alert notification -->
    <div>
      <v-card v-if="!(sessions_success ?? true)">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="sessions_actions.sessionsGetter(accountId, params)"
          style="cursor: pointer"
        >
          Error: {{ sessions_message }}
          <br />
          <small>Haz clic para reintentar</small>
        </v-alert>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessions } from '../../composables/docugen-web/useSessions.js';
import { useAccount } from '../../composables/docugen-web/useAccount.js';
import { useTablesStore } from '../../stores/tablesStore.js';
import { extractTime } from '../../helpers/utils.js';

const route = useRoute();
const router = useRouter();
const accountId = computed(() => route.params.accountId);
const {
  sessions,
  actions: sessions_actions,
  message: sessions_message,
  success: sessions_success,
  loading: sessions_loading,
} = useSessions();
const { account, actions: account_actions } = useAccount();
// Breadcrumbs settings
const breadcrumbs = computed(() => [
  {
    title: 'Cuentas',
    disabled: false,
    to: '/dashboard/accounts',
  },
  {
    title: account.value?.username ?? '',
    disabled: false,
    to: `/dashboard/accounts/${accountId.value}`,
  },
  {
    title: 'Sesiones',
    disabled: true,
  },
]);
// Table settings
const tablesStore = useTablesStore();
const table = computed(() => tablesStore.getTable(4));
const params = ref({
  page: 1,
  limit: 10,
  sortBy: 'status',
  sortOrder: 'asc',
  search: '',
});
const headers = [
  {
    title: 'Inicio',
    key: 'loginTime',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Finalización',
    key: 'logoutTime',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Duración [minutos]',
    key: 'duration',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Estado',
    key: 'status',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
];
//

const status = (itemStatus) => {
  return {
    color:
      itemStatus === 'active'
        ? 'success'
        : itemStatus === 'expired'
          ? 'warning'
          : itemStatus === 'terminated' || 'inactive'
            ? 'error'
            : 'info',
    text:
      itemStatus === 'active'
        ? 'Activo'
        : itemStatus === 'expired'
          ? 'Expirado'
          : itemStatus === 'terminated' || 'inactive'
            ? 'Terminado'
            : 'Sin estado',
  };
};

const handleTableUpdate = async ({ page, itemsPerPage, sortBy }) => {
  params.value.page = itemsPerPage !== params.value.limit ? 1 : page;
  params.value.limit = itemsPerPage;
  params.value.sortBy = sortBy?.[0]?.key ?? 'loginTime';
  params.value.sortOrder = sortBy?.[0]?.order ?? 'asc';
  await sessions_actions.sessionsGetter(accountId.value, params.value);
};

onMounted(async () => {
  await account_actions.accountGetter(accountId.value);
});
</script>

<style scoped></style>
