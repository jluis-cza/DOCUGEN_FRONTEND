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
      <h3>Servicios</h3>
    </div>
    <p class="text-left my-4">
      Configuración de servicios para la cuenta {{ account.username ?? '' }}.
    </p>

    <!-- table -->
    <div class="my-4">
      <v-card>
        <v-data-table-server
          :items-per-page="params.limit"
          :page="params.page"
          :headers="headers"
          :items="services"
          :items-length="table?.pagination?.total || 1"
          :loading="services_loading"
          @update:options="handleTableUpdate"
          :items-per-page-options="[5, 10, 25, 50]"
          hide-default-footer
        >
          <template #[`item.status`]="{ item }">
            <v-chip
              :color="status(item.status).color"
              variant="flat"
              size="small"
              :disabled="item.associated_service_lookup.status === 'stopped'"
              >{{ status(item.status).text }}</v-chip
            >
          </template>
          <template #[`item.actions`]="{ item }">
            <div class="d-flex justify-space-between align-center">
              <v-switch
                :model-value="item.status === 'running'"
                color="primary"
                :label="
                  item.status === 'running'
                    ? 'Deshabilitar servicio'
                    : item.status === 'stopped'
                      ? 'Habilitar servicio'
                      : ''
                "
                inset
                density="compact"
                hide-details
                :disabled="
                  switchingItemId === item._id ||
                  item.associated_service_lookup.status === 'stopped'
                "
                @update:modelValue="
                  (value) => {
                    onSwitchStatus(value, item);
                  }
                "
              ></v-switch>
            </div>
          </template>
        </v-data-table-server>
      </v-card>
    </div>
    <!-- alert notification -->
    <div>
      <v-card v-if="!(services_success ?? true)">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="services_actions.servicesGetter(accountId, params)"
          style="cursor: pointer"
        >
          Error: {{ services_message }}
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
import { useServices } from '../../composables/docugen-web/useServices.js';
import { useService } from '../../composables/docugen-web/useService.js';
import { useAccount } from '../../composables/docugen-web/useAccount.js';
import { useTablesStore } from '../../stores/utils/tablesStore.js';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { extractTime } from '../../helpers/utils.js';
import { DIALOGS } from '../../constants/dialogs.js';

const route = useRoute();
const router = useRouter();
const accountId = computed(() => route.params.accountId);
const switchingItemId = ref(null);
const dialogBoxStore = useDialogBoxStore();
const {
  services,
  actions: services_actions,
  message: services_message,
  success: services_success,
  loading: services_loading,
} = useServices();
const { service, actions: service_actions } = useService();
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
    title: 'Servicios',
    disabled: true,
  },
]);
// Table settings
const tablesStore = useTablesStore();
const table = computed(() => tablesStore.getTable(5));
const params = ref({
  page: 1,
  limit: 10,
  sortBy: 'status',
  sortOrder: 'desc',
  search: '',
});
const headers = [
  {
    title: 'Nombre',
    key: 'associated_service_lookup.name',
    align: 'start',
    sortable: false,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Descripción',
    key: 'associated_service_lookup.description',
    align: 'start',
    sortable: false,
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
  {
    title: 'Acciones',
    key: 'actions',
    align: 'start',
    sortable: false,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
];
//

const status = (itemStatus) => {
  return {
    color: itemStatus === 'running' ? 'success' : itemStatus === 'stopped' ? 'error' : 'info',
    text:
      itemStatus === 'running'
        ? 'Habilitado'
        : itemStatus === 'stopped'
          ? 'Deshabilitado'
          : 'Sin información',
  };
};

const handleTableUpdate = async ({ page, itemsPerPage, sortBy }) => {
  params.value.page = itemsPerPage !== params.value.limit ? 1 : page;
  params.value.limit = itemsPerPage;
  params.value.sortBy = sortBy?.[0]?.key ?? 'status';
  params.value.sortOrder = sortBy?.[0]?.order ?? 'asc';
  await services_actions.servicesGetter(accountId.value, params.value);
};

const onSwitchStatus = async (value, item) => {
  try {
    if (switchingItemId.value === item._id) return;
    switchingItemId.value = item._id;
    const status = value ? 'running' : 'stopped';
    if (status === 'stopped') {
      let dialogBoxData = DIALOGS.docugen_web.administration.user_service_suspension;
      dialogBoxData = {
        ...dialogBoxData,
        text: dialogBoxData.text
          .replace('<service>', item.associated_service_lookup.name)
          .replace('<username>', item.associated_account.username),
      };
      item.status = null; // waiting entry
      dialogBoxStore.setDialogBox({ data: dialogBoxData });
      dialogBoxStore.openDialogBox();
      const response = await dialogBoxStore.requestDialogBoxData();
      const selectedActionKey = response.key;
      dialogBoxStore.resolveDialogBoxProcedure(true);

      if (selectedActionKey === 'n') {
        item.status = 'running';
        switchingItemId.value = null;
        return;
      }
    }
    // Setting the service status
    const id = item._id;
    const payload = { status };
    await service_actions.serviceSetter(id, { data: payload });
  } catch (err) {
    console.log('Error switching the status', err);
  } finally {
    switchingItemId.value = null;
  }
};

onMounted(async () => {
  await account_actions.accountGetter(accountId.value);
});
</script>

<style scoped></style>
