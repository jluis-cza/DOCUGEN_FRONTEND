<template>
  <v-container
    fluid
    v-if="!isItemDetailActive && !isAccountSessionsInfoActive && !isAccountServicesInfoActive"
  >
    <!-- title -->
    <div class="text-left">
      <h3>Cuentas</h3>
    </div>
    <!-- search bar -->
    <div>
      <v-card class="d-flex my-4 pa-2">
        <v-text-field
          v-model="params.search"
          label="Buscar cuenta"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          :loading="accounts_loading"
          @keyup.enter="onSearchClick"
          @click:clear="onClearSearch"
        >
        </v-text-field>
        <v-btn
          color="primary"
          height="56"
          prepend-icon="mdi-magnify"
          @click="onSearchClick"
          :loading="accounts_loading"
        >
          Buscar
        </v-btn>
      </v-card>
    </div>
    <!-- table -->
    <div class="my-4">
      <v-card>
        <v-data-table-server
          :items-per-page="params.limit"
          :page="params.page"
          :headers="headers"
          :items="accounts"
          :items-length="table?.pagination?.total || 1"
          :loading="accounts_loading"
          @update:options="handleTableUpdate"
          :items-per-page-options="[5, 10, 25, 50]"
        >
          <template #[`item.status`]="{ item }">
            <v-chip :color="status(item.status).color" variant="flat" size="small">{{
              status(item.status).text
            }}</v-chip>
          </template>
          <template #[`item.actions`]="{ item }">
            <div class="d-flex justify-space-between align-center">
              <v-switch
                :model-value="item.status === 'active'"
                color="primary"
                :label="
                  item.status === 'active'
                    ? 'Suspender cuenta'
                    : item.status === 'suspended'
                      ? 'Activar cuenta'
                      : ''
                "
                inset
                density="compact"
                hide-details
                :disabled="
                  switchingItemId === item._id ||
                  (item.status !== 'active' && item.status !== 'suspended')
                "
                @update:modelValue="
                  (value) => {
                    onSwitchStatus(value, item);
                  }
                "
              ></v-switch>
              <v-btn @click="viewItemDetail(item._id)" class="bg-info" size="small" variant="tonal">
                <template #prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                Ver
              </v-btn>
            </div>
          </template>
        </v-data-table-server>
      </v-card>
    </div>
    <!-- alert notification -->
    <div>
      <v-card v-if="!(accounts_success ?? true)">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="accounts_actions.accountsGetter(params)"
          style="cursor: pointer"
        >
          Error: {{ accounts_message }}
          <br />
          <small>Haz clic para reintentar</small>
        </v-alert>
      </v-card>
    </div>
    <DialogBox />
  </v-container>
  <RouterView />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DialogBox from '../DialogBox.vue';
import { useTablesStore } from '../../stores/utils/tablesStore.js';
import { useAccounts } from '../../composables/docugen-web/useAccounts.js';
import { useAccount } from '../../composables/docugen-web/useAccount.js';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { TABLES } from '../../constants/tables.js';

const router = useRouter();
const route = useRoute();
const isItemDetailActive = computed(() => (route.name === 'account-detail' ? true : false));
const isAccountSessionsInfoActive = computed(() => (route.name === 'sessions' ? true : false));
const isAccountServicesInfoActive = computed(() =>
  route.name === 'account-services' ? true : false
);

// Table headers
const headers = [
  {
    title: 'Nombre de usuario',
    key: 'username',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Nombre',
    key: 'user.name',
    align: 'start',
    sortable: true,
    headerProps: {
      class: 'bg-accent font-weight-bold',
    },
  },
  {
    title: 'Apellido',
    key: 'user.lastname',
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

const status = (itemStatus) => {
  return {
    color:
      itemStatus === 'active'
        ? 'success'
        : itemStatus === 'suspended'
          ? 'warning'
          : itemStatus === 'inactive'
            ? 'error'
            : 'info',
    text:
      itemStatus === 'active'
        ? 'Activo'
        : itemStatus === 'suspended'
          ? 'Suspendido'
          : itemStatus === 'inactive'
            ? 'Inactivo'
            : 'Sin estado',
  };
};
const switchingItemId = ref(null);
const dialogBoxStore = useDialogBoxStore();
const tablesStore = useTablesStore();
const table = computed(() => tablesStore.getTable(2));
const params = ref({
  page: 1,
  limit: 10,
  sortBy: 'username',
  sortOrder: 'asc',
  search: '',
});
const {
  accounts,
  actions: accounts_actions,
  loading: accounts_loading,
  success: accounts_success,
  message: accounts_message,
  code: accounts_code,
} = useAccounts();

const { account, actions: account_actions } = useAccount();
const onSearchClick = async () => {
  await accounts_actions.accountsGetter(params.value);
};

const onClearSearch = () => {
  params.value.search = '';
};

const handleTableUpdate = async ({ page, itemsPerPage, sortBy }) => {
  params.value.page = itemsPerPage !== params.value.limit ? 1 : page;
  params.value.limit = itemsPerPage;
  params.value.sortBy = sortBy?.[0]?.key ?? 'username';
  params.value.sortOrder = sortBy?.[0]?.order ?? 'asc';
  await accounts_actions.accountsGetter(params.value);
};

const onSwitchStatus = async (value, item) => {
  try {
    if (switchingItemId.value === item._id) return;
    switchingItemId.value = item._id;
    const status = value ? 'active' : 'suspended';
    if (status === 'suspended') {
      const dialogBoxData = {
        title: 'Suspención de usuario',
        icon: 'mdi-account-off',
        text: `¿Está seguro de suspender al usuario ${item.username}? El usuario no podrá seguir usando los servicios de DOCUGEN y tampoco podrá ingresar al sistema.`,
        actions: [
          { name: 'Continuar', key: 'y' },
          { name: 'Cancelar', key: 'n' },
        ],
      };
      item.status = null; // waiting entry
      const selectedActionKey = await dialogBoxStore.openDialogBox(dialogBoxData);
      dialogBoxStore.resetDialogBox();
      if (selectedActionKey === 'n') {
        item.status = 'active';
        switchingItemId.value = null;
        return;
      }
    }
    // Setting the service
    const id = item._id;
    const payload = { status };
    await account_actions.accountSetter(id, { data: payload });
  } catch (err) {
    console.log('Error switching the status', err);
  } finally {
    switchingItemId.value = null;
  }
};

const viewItemDetail = (id) => {
  if (!id) throw new Error('There is no item id');
  router.push(`/dashboard/accounts/${id}`);
};
</script>

<style scoped>
.v-data-table-server {
  border-radius: 8px;
  overflow: hidden;
}
</style>
