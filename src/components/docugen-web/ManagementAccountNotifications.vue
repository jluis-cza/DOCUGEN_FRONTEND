<template>
  <v-container fluid class="overflow-x-auto">
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

    <!-- Notifications Box -->
    <v-card min-width="700">
      <!-- title -->
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-bell"></v-icon>
        </template>
        <v-card-title>Notificaciones</v-card-title>
      </v-card-item>
      <!-- Messages-->
      <v-card-item class="bg-surface">
        <v-list>
          <v-infinite-scroll
            :height="400"
            side="end"
            @load="onLoad"
            class="bg-background"
            ref="infiniteScrollRef"
          >
            <template v-for="notification in notifications" :key="notification._id">
              <v-list-item>
                <v-card variant="tonal" color="info" class="mx-auto mb-2">
                  <v-card-item>
                    <template #prepend>
                      <v-icon icon="mdi-message-text-outline"></v-icon>
                    </template>
                    <v-card-title class="text-primary">
                      {{ notification.subject }}
                    </v-card-title>
                    <v-card-subtitle class="text-secondary">
                      Enviado por {{ getUsername(notification.from) }} el
                      {{ extractTime(notification.createdAt, 'America/La_Paz', 'long').date }} a las
                      {{ extractTime(notification.createdAt, 'America/La_Paz', 'long').hour }}
                    </v-card-subtitle>
                  </v-card-item>
                  <v-card-text>
                    {{ notification.message }}
                  </v-card-text>
                </v-card>
              </v-list-item>
            </template>
            <template #empty>
              <div class="text-center text-caption text-medium-emphasis py-2">
                No hay más notificationes
              </div>
            </template>
            <template #error>
              <div class="text-center py-2">
                <span class="text-caption text-error">{{ notifications_message }}</span>
              </div>
            </template>
          </v-infinite-scroll>
        </v-list>
      </v-card-item>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createNotification()" class="bg-info" variant="tonal">
          <template #prepend>
            <v-icon icon="mdi-message-plus-outline"> </v-icon>
          </template>
          Crear notificación
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUsername } from '../../composables/docugen-web/useUsername.js';
import { useNotification } from '../../composables/docugen-web/useNotification.js';
import { useNotifications } from '../../composables/docugen-web/useNotifications.js';
import { useAdminAccounts } from '../../composables/lookup/useAdminAccounts.js';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useListsStore } from '../../stores/utils/listsStore.js';
import { useNotificationsStore } from '../../stores/docugen-web/notificationsStore.js';
import { DIALOGS } from '../../constants/dialogs.js';
import { extractTime } from '../../helpers/utils.js';
// import { LISTS } from '../../constants/lists.js';

// const getDefaultListsQuery = () => JSON.parse(JSON.stringify(LISTS.default))
const router = useRouter();
const route = useRoute();
const { username, actions: username_actions } = useUsername();
const { notification, actions: notification_actions } = useNotification();
const {
  notifications,
  actions: notifications_actions,
  message: notifications_message,
} = useNotifications();
const { adminAccounts, actions: adminAccounts_actions } = useAdminAccounts();
const dialogBoxStore = useDialogBoxStore();
const myAccountStore = useMyAccountStore();
const listsStore = useListsStore();
const notificationsStore = useNotificationsStore();
const dialogBoxDataSet = {
  createNotification: DIALOGS.docugen_web.management.create_notification,
  default: DIALOGS.default,
};
const listId = 2;

// listsStore.resetList(listId);
const pagination = computed(() => listsStore.getList(listId));
const accountId = computed(() => route.params.accountId);
const myAccountId = computed(() => myAccountStore.getMyAccount.id);
// const notificationsLayout = ref([]);
// const params = ref({
//   to: accountId.value,
//   cursor: pagination.value.cursor,
//   limit: pagination.value.limit,
// });
const params = computed(() => {
  return {
    to: accountId.value,
    cursor: pagination.value.cursor,
    limit: pagination.value.limit,
  };
});
// Breadcrumbs settings
const breadcrumbs = computed(() => [
  {
    title: 'Cuentas',
    disabled: false,
    to: '/dashboard/accounts',
  },
  {
    title: username.value ?? '',
    disabled: false,
    to: `/dashboard/accounts/${accountId.value}`,
  },
  {
    title: 'Notificaciones',
    disabled: true,
  },
]);

const createNotification = async () => {
  let exitDialog = false;
  let dialogBoxData = dialogBoxDataSet.createNotification;
  dialogBoxData = {
    ...dialogBoxData,
    text: dialogBoxData.text.replace('<username>', username.value),
  };

  dialogBoxStore.setDialogBox({
    metadata: {
      isRequested: true,
    },
    data: dialogBoxData,
  });
  dialogBoxStore.openDialogBox();
  do {
    const response = await dialogBoxStore.requestDialogBoxData();
    if (response.key === 'y') {
      exitDialog = response.isValid;
      if (exitDialog) {
        const message = response.parameters.find((p) => p.key === 'message').value;
        const subject = response.parameters.find((p) => p.key === 'subject').value;
        const payload = { to: accountId.value, from: myAccountId.value, subject, message };
        await notification_actions.notificationCreator({ data: payload });
        await scrollToTop();
      }
    } else if (response.key === 'n') {
      exitDialog = true;
    } else {
      exitDialog = false;
    }
    dialogBoxStore.resolveDialogBoxProcedure(exitDialog);
  } while (!exitDialog);
};

const onLoad = async ({ done }) => {
  try {
    console.log('entrando a load ----------->');
    if (!pagination.value.hasNextChunk) {
      done('empty');
      return;
    }

    await notifications_actions.notificationsGetter(params.value);
    // if (notifications.value && notifications.value.length > 0) {
    //   notificationsLayout.value.push(...notifications.value);
    // }

    if (!pagination.value.hasNextChunk) {
      done('empty');
    } else {
      done('ok');
    }
  } catch (error) {
    console.error('Error loading the list. ', error);
    done('error');
  }
};

const getUsername = (usernameId) => {
  const username = adminAccounts.value.find((a) => a._id === usernameId)?.username;
  return username || '';
};

// Referencia al componente o contenedor con scroll
const infiniteScrollRef = ref(null);

const scrollToTop = async () => {
  // Esperar a que Vue inserte el nuevo elemento en el DOM
  await nextTick();

  // Obtener el elemento del DOM con scroll
  const scrollEl = infiniteScrollRef.value?.$el || infiniteScrollRef.value;

  if (scrollEl) {
    scrollEl.scrollTo({
      top: 0,
      behavior: 'smooth', // Animación fluida de deslizamiento
    });
  }
};

onMounted(async () => {
  listsStore.resetList(listId);
  notificationsStore.resetNotifications();

  await username_actions.usernameGetter({ id: accountId.value });
  await adminAccounts_actions.adminAccountsLookup();
  // await notifications_actions.notificationsGetter({ to: accountId.value });
});
</script>

<style scoped></style>
