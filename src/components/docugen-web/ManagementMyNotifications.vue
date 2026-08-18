<template>
  <v-card min-width="480" rounded="lg" elevation="3">
    <v-card-title> Notificaciones</v-card-title>
    <v-divider></v-divider>
    <v-infinite-scroll height="420" :items="safeNotifications" side="end" @load="onLoad">
      <div>
        <v-list>
          <v-list-item v-for="notification in safeNotifications" :key="notification._id">
            <v-card
              class="w-100 notification-card notification-card--neutral"
              :class="
                notification.status === 'sent'
                  ? 'notification-card--unread'
                  : 'notification-card--read'
              "
              color="surface"
              variant="tonal"
            >
              <v-card-title class="d-flex align-center justify-space-between">
                <span>{{ notification.subject || 'Sin asunto' }}</span>
                <v-icon
                  :icon="
                    notification.status === 'sent'
                      ? 'mdi-checkbox-blank-circle-outline'
                      : 'mdi-check-circle'
                  "
                  :color="notification.status === 'sent' ? 'primary' : 'success'"
                  size="small"
                  class="ms-2"
                />
              </v-card-title>
              <v-card-subtitle>
                {{ getSenderLabel(notification) }} ·
                {{ getNotificationTime(notification.createdAt) }}
              </v-card-subtitle>
              <v-card-text>
                <div v-if="isNotificationOpen(notification._id)" class="notification-message mt-1">
                  {{ notification.message || 'Sin mensaje' }}
                </div>
                <div v-else class="notification-hidden text-caption mt-1">Mensaje oculto</div>
                <div class="mt-2 text-decoration-underline text-info">
                  <span
                    v-if="isNotificationOpen(notification._id)"
                    class="cursor-pointer"
                    @click.stop="toggleNotification(notification)"
                  >
                    Ocultar mensaje
                  </span>
                  <span
                    v-else
                    class="cursor-pointer"
                    @click.stop="toggleNotification(notification)"
                  >
                    Ver mensaje
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
      </div>
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
import { onMounted, ref, computed, watch } from 'vue';
import { useMyNotificationsStore } from '../../stores/docugen-web/myNotificationsStore.js';
import { useMyNotifications } from '../../composables/docugen-web/useMyNotifications.js';
import { useMyNotification } from '../../composables/docugen-web/useMyNotification.js';
import { useUsername } from '../../composables/docugen-web/useUsername.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useListsStore } from '../../stores/utils/listsStore.js';
import { extractTime } from '../../helpers/utils.js';

const myAccountStore = useMyAccountStore();
const listsStore = useListsStore();
const myNotificationsStore = useMyNotificationsStore();
const {
  myNotifications,
  actions: myNotifications_actions,
  message: myNotifications_message,
} = useMyNotifications();
const { actions: myNotification_actions } = useMyNotification();
const { username, actions: username_actions, success: username_success } = useUsername();
const accounId = computed(() => myAccountStore.getMyAccount.id);
const defaultNotificationsQuery = () => ({ cursor: null, limit: 5, hasNextChunk: true });
const query = computed(() => listsStore.getList(1) ?? defaultNotificationsQuery());
const openNotifications = ref({});
const senderNames = ref({});
const isLoadingNotifications = ref(false);
const isInitialLoadDone = ref(false);
const safeNotifications = computed(() =>
  Array.isArray(myNotifications.value)
    ? myNotifications.value.map((notification) => ({
        ...notification,
        subject: notification?.subject || 'Sin asunto',
        message: notification?.message || 'Sin mensaje',
        status: notification?.status || 'sent',
      }))
    : []
);

const isNotificationOpen = (notificationId) => Boolean(openNotifications.value[notificationId]);

const getSenderLabel = (notification) => {
  if (!notification) return 'Sistema';

  if (notification.senderName) return notification.senderName;

  if (typeof notification.from === 'string') {
    return senderNames.value[notification.from] || notification.fromUsername || 'Sistema';
  }

  if (notification.from && typeof notification.from === 'object') {
    return (
      notification.from.username ||
      notification.from.name ||
      notification.fromUsername ||
      notification.senderName ||
      'Sistema'
    );
  }

  return 'Sistema';
};

const getNotificationTime = (value) => {
  if (!value) return 'Fecha no disponible';

  const details = extractTime(value, 'America/La_Paz', 'long');
  if (details && typeof details === 'object') {
    return `${details.date} a las ${details.hour}`;
  }
  return value || 'Fecha no disponible';
};

const params = computed(() => ({ to: accounId.value, ...query.value }));

const onLoad = async ({ done }) => {
  if (isLoadingNotifications.value) {
    done('ok');
    return;
  }

  const currentQuery = listsStore.getList(1) ?? defaultNotificationsQuery();
  if (currentQuery.hasNextChunk === false) {
    done('empty');
    return;
  }

  isLoadingNotifications.value = true;

  try {
    await myNotifications_actions.notificationsGetter(params.value);
    const nextQuery = listsStore.getList(1) ?? defaultNotificationsQuery();
    isInitialLoadDone.value = true;
    done(nextQuery.hasNextChunk ? 'ok' : 'empty');
  } catch (error) {
    console.error('Error loading the list. ', error);
    done('error');
  } finally {
    isLoadingNotifications.value = false;
  }
};

const ackNotification = async (notificationId) => {
  await myNotification_actions.notificationAcknowledger(notificationId);
};

const toggleNotification = async (notification) => {
  if (!notification?._id) return;

  const isOpen = Boolean(openNotifications.value[notification._id]);
  const willOpen = !isOpen;
  openNotifications.value[notification._id] = willOpen;

  if (willOpen && notification.status === 'sent') {
    await ackNotification(notification._id);
  }
};

const resolveSenderName = async (notification) => {
  if (!notification?.from) return;

  const senderId =
    typeof notification.from === 'string' ? notification.from : notification.from?._id;
  if (!senderId || senderNames.value[senderId]) return;

  try {
    await username_actions.usernameGetter({ id: senderId });
    if (username_success.value && username.value) {
      senderNames.value[senderId] = username.value;
    }
  } catch (error) {
    console.warn('No se pudo resolver el remitente:', error);
  }
};

const hydrateSenderNames = async () => {
  if (!Array.isArray(myNotifications.value)) return;

  await Promise.all(myNotifications.value.map((notification) => resolveSenderName(notification)));
};

onMounted(async () => {
  listsStore.resetList(1);
  myNotificationsStore.resetMyNotifications();
  isInitialLoadDone.value = false;
  isLoadingNotifications.value = false;
  await hydrateSenderNames();
});

watch(
  () => myNotifications.value,
  async () => {
    await hydrateSenderNames();
  },
  { deep: true }
);
</script>

<style scoped>
.notification-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.notification-card--unread,
.notification-card--read {
  background: rgba(var(--v-theme-surface-variant), 0.55) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.08);
}

.notification-message {
  background: rgba(var(--v-theme-primary), 0.04);
  color: rgb(var(--v-theme-on-surface));
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.notification-hidden {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.8;
}
</style>
