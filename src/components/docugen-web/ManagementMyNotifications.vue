<template>
  <v-card min-width="480" rounded="lg" elevation="3">
    <v-card-title> Notificaciones</v-card-title>
    <v-divider></v-divider>
    <v-list>
      <v-infinite-scroll height="420" side="end" @load="onLoad">
        <template v-for="notification in myNotifications" :key="notification._id">
          <v-list-item>
            <v-card variant="tonal" color="primary" class="mx-auto mb-2">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-message-text-outline"></v-icon>
                </template>
                <template #append>
                  <v-icon
                    size="small"
                    icon="mdi-check-all"
                    :color="notification.status === 'sent' ? 'grey' : 'blue'"
                  ></v-icon>
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
                <p v-if="notification?.isOpen || false">
                  {{ notification.message }}
                </p>
                <p
                  @click="
                    notification.isOpen = !notification.isOpen;
                    notification.isAcknowledged ? null : ackNotification(notification);
                  "
                  class="text-info cursor-pointer text-decoration-underline"
                >
                  {{ notification.isOpen ? 'Ocultar mensaje' : 'Ver mensaje' }}
                </p>
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
            <span class="text-caption text-error">{{ myNotifications_message }}</span>
          </div>
        </template>
      </v-infinite-scroll>
    </v-list>
  </v-card>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useMyNotifications } from '../../composables/docugen-web/useMyNotifications.js';
import { useMyNotification } from '../../composables/docugen-web/useMyNotification.js';
import { useUsername } from '../../composables/docugen-web/useUsername.js';
import { useAdminAccounts } from '../../composables/lookup/useAdminAccounts.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useMyNotificationsStore } from '../../stores/docugen-web/myNotificationsStore.js';
import { useListsStore } from '../../stores/utils/listsStore.js';
import { extractTime } from '../../helpers/utils.js';

const myAccountStore = useMyAccountStore();
const listsStore = useListsStore();
const myNotificationsStore = useMyNotificationsStore();
const {
  myNotifications,
  actions: myNotifications_actions,
  success: myNotifications_success,
  loading: myNotifications_loading,
  message: myNotifications_message,
} = useMyNotifications();
const {
  myNotification,
  actions: myNotification_actions,
  success: myNotification_success,
  loading: myNotification_loading,
  message: myNotification_message,
} = useMyNotification();
const { username, actions: username_actions, success: username_success } = useUsername();
const { adminAccounts, actions: adminAccounts_actions } = useAdminAccounts();

const listId = 1;
const pagination = computed(() => listsStore.getList(listId));
const accounId = computed(() => myAccountStore.getMyAccount.id);

const params = computed(() => {
  return { to: accounId.value, cursor: pagination.value.cursor, limit: pagination.value.limit };
});

const onLoad = async ({ done }) => {
  try {
    if (!pagination.value.hasNextChunk) {
      done('empty');
      return;
    }

    await myNotifications_actions.notificationsGetter(params.value);
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

const ackNotification = async (notification) => {
  if (notification.status === 'sent') {
    await myNotification_actions.notificationAcknowledger(notification._id);
    if (myNotification_success) {
      notification.isAcknowledged = true;
      myNotificationsStore.decreaseMyNotificationsCount(1);
    }
  }
};

const getUsername = (usernameId) => {
  const username = adminAccounts.value.find((a) => a._id === usernameId)?.username;
  return username || '';
};

onMounted(async () => {
  listsStore.resetList(listId);
  myNotificationsStore.resetMyNotifications();
  // await myNotifications_actions.notificationsGetter(params.value);
  await adminAccounts_actions.adminAccountsLookup();
});
</script>

<style scoped></style>
