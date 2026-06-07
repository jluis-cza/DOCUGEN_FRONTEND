<template>
  <v-container fluid v-if="!isItemDetailActive">
    <!-- Link -->
    <!-- <div class="text-right"> -->
    <!-- <span
      ><v-icon
          v-if="serviceSwitcherPromt === 'general'"
          :icon="serviceSwitcher.icon.particular"
        ></v-icon
      ></span> -->
    <!-- <span
        class="text-info cursor-pointer text-decoration-underline"
        @click="serviceSwitcher.transporter[serviceSwitcherPromt]"
        >{{ serviceSwitcher.text[serviceSwitcherPromt] }}</span
      > -->
    <!-- <span
      ><v-icon
      v-if="serviceSwitcherPromt === 'particular'"
      :icon="serviceSwitcher.icon.general"
      ></v-icon
      ></span> -->
    <!-- </div> -->
    <!-- Title -->
    <div class="text-left">
      <h3>Servicios</h3>
    </div>
    <!-- General -->
    <!-- <template v-if="!isServicesAccountsActive"> -->
    <!-- Description -->
    <p class="text-left my-4">Configuración global de servicios.</p>
    <!-- Table -->
    <div class="my-4">
      <v-card>
        <v-data-table
          :items="serviceLookups"
          :headers="headers"
          :loading="loading"
          v-model:sort-by="sortBy"
          hide-default-footer
        >
          <template #[`item.status`]="{ item }">
            <v-chip :color="status(item.status).color" variant="flat" size="small">{{
              status(item.status).text
            }}</v-chip>
          </template>
          <template #[`item.actions`]="{ item }">
            <div class="d-flex justify-space-between align-center">
              <v-switch
                :model-value="item.status === 'running'"
                color="primary"
                :label="
                  item.status === 'running'
                    ? 'Desactivar servicio'
                    : item.status === 'stopped'
                      ? 'Activar servicio'
                      : ''
                "
                inset
                density="compact"
                hide-details
                :disabled="switchingItemId === item._id"
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
        </v-data-table>
      </v-card>
    </div>
    <!-- Notifications -->
    <div>
      <v-card v-if="!(success ?? true)">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          @click="actions.serviceLookupsGetter()"
          style="cursor: pointer"
        >
          Error: {{ message }}
          <br />
          <small>Haz clic para reintentar</small>
        </v-alert>
      </v-card>
    </div>
    <DialogBox />
    <!-- </template> -->
    <!-- Particular -->
    <!-- <template v-else> -->
    <!-- Description -->
    <!-- <p class="text-left my-4">Configuración de servicios por cuenta.</p>
      <RouterView />
    </template> -->
  </v-container>
  <RouterView />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DialogBox from '../DialogBox.vue';
import { useServiceLookups } from '../../composables/docugen-web/useServiceLookups.js';
import { useServiceLookup } from '../../composables/docugen-web/useServiceLookup.js';
import { useTablesStore } from '../../stores/utils/tablesStore.js';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';

const router = useRouter();
const route = useRoute();
const isItemDetailActive = computed(() => (route.name === 'service-lookup-detail' ? true : false));

const headers = [
  {
    title: 'Nombre',
    key: 'name',
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
const sortBy = ref([{ key: 'name', order: 'asc' }]);
const switchingItemId = ref(null);
const dialogBoxStore = useDialogBoxStore();
const tablesStore = useTablesStore();
const tableId = 3;
const { serviceLookups, actions, loading, success, message, code } = useServiceLookups();
const { serviceLookup, actions: serviceLookup_actions } = useServiceLookup();
// const route = useRoute();
// const router = useRouter();
// const isServicesAccountsActive = computed(() =>
//   route.name === 'services-accounts' ? true : false
// );
// const serviceSwitcherPromt = computed(() =>
//   isServicesAccountsActive.value ? 'general' : 'particular'
// );
// const serviceSwitcher = {
//   transporter: {
//     general: () => {
//       router.push('/dashboard/categories/services');
//     },
//     particular: () => {
//       router.push('/dashboard/services/accounts');
//     },
//   },
//   text: {
//     general: 'Ir a la configuración global de servicios',
//     particular: 'Ir a la configuración de servicios por cuenta',
//   },
//   icon: {
//     general: 'mdi-arrow-right',
//     particular: 'mdi-arrow-left',
//   },
// };

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

const onSwitchStatus = async (value, item) => {
  try {
    if (switchingItemId.value === item._id) return;
    switchingItemId.value = item._id;
    const status = value ? 'running' : 'stopped';
    if (status === 'stopped') {
      const dialogBoxData = {
        title: 'Desactivación del servicio',
        icon: 'mdi-power-off',
        text: `¿Está seguro de poner fuera de servicio la ${item.name} de manera global?`,
        actions: [
          { name: 'Aceptar', key: 'y' },
          { name: 'Cancelar', key: 'n' },
        ],
      };
      item.status = null; // waiting entry
      const selectedActionKey = await dialogBoxStore.openDialogBox(dialogBoxData);
      dialogBoxStore.resetDialogBox();
      if (selectedActionKey === 'n') {
        item.status = 'running';
        switchingItemId.value = null;
        return;
      }
    }
    // Setting the service lookup status
    const id = item._id;
    const payload = { status };
    await serviceLookup_actions.serviceLookupSetter(id, { data: payload });
  } catch (err) {
    console.log('Error switching the status', err);
  } finally {
    switchingItemId.value = null;
  }
};

const viewItemDetail = (id) => {
  if (!id) throw new Error('There is no item id');
  router.push(`/dashboard/services/${id}`);
};

watch(sortBy, (newValue, oldValue) => {
  tablesStore.setTable(tableId, {
    sort: { by: newValue[0].key, order: newValue[0].order },
  });
});

onMounted(async () => {
  await actions.serviceLookupsGetter();
});
</script>

<style scoped></style>
