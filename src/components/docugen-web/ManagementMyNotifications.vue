<template>
  <v-card min-width="480" rounded="lg" elevation="3">
    <v-card-title> Notificaciones</v-card-title>
    <v-divider></v-divider>
    <v-infinite-scroll height="420" :items="myNotifications" side="end" @load="onLoad">
      <div>
        <v-list>
          <v-list-item v-for="notification in myNotifications" :key="notification._id">
            <v-card>
              <v-card-title>
                {{ notification.subject }}
              </v-card-title>
              <v-card-subtitle>
                de
                {{ getUsername(notification.from) }}
              </v-card-subtitle>
              <v-card-text>
                <span
                  v-if="!isOpen"
                  @click="isAcknowledged ? null : ackNotification(notification._id)"
                  class="d-inline-block text-truncate"
                  style="max-width: 150px"
                >
                  {{ notification.message }}
                </span>
                <p v-else>
                  {{ notification.message }}
                </p>
                <span
                  @click="isOpen = !isOpen"
                  class="cursor-pointer text-decoration-underline text-info"
                >
                  {{ isOpen ? 'Ver menos' : 'Ver más' }}
                </span>
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
      </div>
      <!-- <div v-else class="text-center text-medium-emphasis">
        <div class="text-body-2">No tienes notificaciones.</div>
      </div> -->
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
  </v-card>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useMyNotificationsStore } from '../../stores/docugen-web/myNotificationsStore.js';
import { useMyNotifications } from '../../composables/docugen-web/useMyNotifications.js';
import { useMyNotification } from '../../composables/docugen-web/useMyNotification.js';
import { useUsername } from '../../composables/docugen-web/useUsername.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useListsStore } from '../../stores/utils/listsStore.js';

const myAccountStore = useMyAccountStore();
const listsStore = useListsStore();
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
const accounId = computed(() => myAccountStore.getMyAccount.id);
const query = computed(() => listsStore.getList(1));
const isOpen = ref(false);
const isAcknowledged = ref(false);

const params = computed(() => {
  return { to: accounId.value, ...query.value };
});

const onLoad = async ({ done }) => {
  try {
    await myNotifications_actions.notificationsGetter(params.value);
    if (!query.value.hasNextChunck) {
      done('empty');
    } else {
      done('ok');
    }
  } catch (error) {
    console.error('Error loading the list. ', error);
    done('error');
  }
};

const ackNotification = async (notificationId) => {
  await myNotification_actions.notificationAcknowledger({ id: notificationId });
  if (myNotification_success) {
    isAcknowledged.value = true;
  }
};

const getUsername = async (usernameId) => {
  await username_actions.usernameGetter({ id: usernameId });
  return username_success ? username.value : '';
};

onMounted(async () => {
  await myNotifications_actions.notificationsGetter(params.value);
});
</script>

<style scoped></style>
