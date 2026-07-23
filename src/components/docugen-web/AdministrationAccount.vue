<template>
  <v-container fluid v-if="!isAccountSessionsInfoActive && !isAccountServicesInfoActive">
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
      <!-- Account info -->
      <v-card>
        <!-- Title -->
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-account"></v-icon>
          </template>
          <v-card-title> {{ account.username }}</v-card-title>
        </v-card-item>
        <!-- Review info -->
        <v-card-item>
          <v-list density="compact">
            <template v-for="(item, i) in cardInfo" :key="i">
              <v-list-item>
                <div class="d-flex justify-space-between align-center">
                  <span class="font-weight-medium text-secondary">{{ item.label }}</span>
                  <span class="font-weight-light">
                    <template v-if="item.label === 'Estado'">
                      <v-chip size="small" :color="item.data[1]" variant="flat">{{
                        item.data[0]
                      }}</v-chip>
                    </template>
                    <template v-else-if="item.label === 'Sesiones'">
                      <span
                        class="text-info cursor-pointer text-decoration-underline"
                        @click="viewAccountSessions(accountId)"
                        >Ver sesiones</span
                      >
                    </template>
                    <template v-else-if="item.label === 'Servicios'">
                      <span
                        class="text-info cursor-pointer text-decoration-underline"
                        @click="viewAccountServices(accountId)"
                        >Ver servicios</span
                      >
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
      <!-- Account Sessions Info -->
      <AdministrationAccountSessions v-if="false" />
    </template>
  </v-container>
  <RouterView />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAccount } from '../../composables/docugen-web/useAccount.js';
import { extractTime } from '../../helpers/utils.js';
import AdministrationAccountSessions from './AdministrationAccountSessions.vue';

const route = useRoute();
const router = useRouter();
const accountId = ref('');
const isAccountSessionsInfoActive = computed(() => (route.name === 'sessions' ? true : false));
const isAccountServicesInfoActive = computed(() =>
  route.name === 'account-services' ? true : false
);
const { account, actions, loading } = useAccount();
const breadcrumbs = computed(() => [
  {
    title: 'Cuentas',
    disabled: false,
    to: '/dashboard/accounts',
  },
  {
    title: account.value?.username ?? '',
    disabled: true,
  },
]);

// Review info
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
const role = (itemRole) => {
  return {
    text:
      itemRole === 'dev'
        ? 'Desarrollador'
        : itemRole === 'admin'
          ? 'Administrador'
          : 'Sin Información',
  };
};

const cardInfo = computed(() => {
  return [
    { label: 'Nombre', data: account.value?.user?.name || '' },
    { label: 'Apellido', data: account.value?.user?.lastname || '' },
    { label: 'Email', data: account.value?.user?.email || '' },
    { label: 'Rol', data: role(account.value.role).text },
    {
      label: 'Estado',
      data: [status(account.value.status).text, status(account.value.status).color],
    },
    {
      label: 'Servicios',
      data: 'Ver servicios',
    },
    {
      label: 'Fecha de creación',
      data: `${extractTime(account.value.createdAt, 'America/La_Paz', 'long').date} - ${extractTime(account.value.createdAt, 'America/La_Paz', 'long').hour}`,
    },
    {
      label: 'Fecha de actualización',
      data: `${extractTime(account.value.updatedAt, 'America/La_Paz', 'long').date} - ${extractTime(account.value.updatedAt, 'America/La_Paz', 'long').hour}`,
    },
    { label: 'Sesiones', data: 'Ver sesiones' },
  ];
});

const viewAccountSessions = (id) => {
  if (!id) throw new Error('There is no account id');
  router.push(`/dashboard/accounts/${id}/sessions`);
};

const viewAccountServices = (id) => {
  if (!id) throw new Error('There is no account id');
  router.push(`/dashboard/accounts/${id}/services`);
};

onMounted(async () => {
  accountId.value = route.params.accountId;
  await actions.accountGetter(accountId.value);
});
</script>

<style scoped></style>
