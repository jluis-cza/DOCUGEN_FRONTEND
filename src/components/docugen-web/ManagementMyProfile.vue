<template>
  <div>
    <!-- Tabs Navigation -->
    <v-tabs v-model="activeTab" class="mb-4" @update:model-value="handleTabChange">
      <v-tab value="info" prepend-icon="mdi-account"> Mi Información </v-tab>
      <v-tab v-if="myProfile.role === 'dev'" value="api-tokens" prepend-icon="mdi-key-link">
        Tokens de API
      </v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Tab 1: Mi Información -->
      <v-window-item value="info">
        <v-card>
          <!-- Title -->
          <v-card-item>
            <template #prepend>
              <v-icon icon="mdi-account" color="primary" />
            </template>
            <v-card-title>Mi perfil</v-card-title>
            <template #append>
              <v-badge
                v-if="myProfile.username"
                dot
                location="bottom end"
                :color="profileStatus(myProfile.status).color"
                offset-x="4"
                offset-y="4"
              >
                <v-avatar
                  v-if="profilePictureData"
                  size="48"
                  color="surface"
                  :image="profilePictureData"
                />
                <v-avatar v-else-if="myProfile.username" size="48" color="surface">
                  <span class="text-primary font-weight-bold">{{ userInitials }}</span>
                </v-avatar>
              </v-badge>
              <v-avatar v-else size="48" color="surface" />
            </template>
          </v-card-item>
          <!-- Review info -->
          <v-card-item>
            <v-list density="compact">
              <template v-for="(item, i) in cardInfo" :key="i">
                <v-list-item>
                  <div class="d-flex justify-space-between align-center">
                    <span class="font-weight-medium text-secondary">{{ item.label }}</span>
                    <span class="font-weight-light">
                      <template v-if="item.key === 'username' || item.key === 'password'">
                        <div class="text-right">
                          <div>
                            {{ item.data }}
                          </div>
                          <div
                            class="cursor-pointer text-decoration-underline text-info"
                            @click="setValue(item.key)"
                            v-if="myProfile.role === 'dev'"
                          >
                            Cambiar
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        {{ item.data }}
                      </template>
                    </span>
                  </div>
                </v-list-item>
                <v-divider></v-divider>
              </template>
              <v-list-item>
                <div class="d-flex flex-wrap justify-space-between align-center ga-3">
                  <span class="font-weight-medium text-secondary">Imagen de perfil</span>
                  <div class="d-flex flex-column align-end ga-1">
                    <div class="d-flex flex-wrap justify-end ga-2">
                      <span
                        class="cursor-pointer text-decoration-underline text-primary"
                        :class="{ 'text-disabled': profilePictureLoading }"
                        @click="!profilePictureLoading && profilePictureInput?.click()"
                      >
                        {{
                          profilePictureLoading
                            ? 'Procesando...'
                            : profilePictureData
                              ? 'Actualizar imagen'
                              : 'Subir imagen'
                        }}
                      </span>
                      <span
                        v-if="profilePictureData"
                        class="cursor-pointer text-decoration-underline text-error"
                        :class="{ 'text-disabled': profilePictureLoading }"
                        @click="!profilePictureLoading && (confirmPictureRemoval = true)"
                      >
                        Eliminar imagen
                      </span>
                    </div>
                    <span class="text-caption text-medium-emphasis">
                      JPEG, PNG o WebP; tamaño máximo 1 MiB.
                    </span>
                  </div>
                  <input
                    ref="profilePictureInput"
                    class="d-none"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="onProfilePictureSelected"
                  />
                </div>
              </v-list-item>
              <v-divider></v-divider>
            </v-list>
          </v-card-item>
          <!-- profile update date -->
          <v-card-item>
            <p class="text-caption text-secondary text-right">
              Última actualización el {{ profileUpdateTime.date }} a las
              {{ profileUpdateTime.hour }}.
            </p>
          </v-card-item>
        </v-card>
      </v-window-item>

      <!-- Tab 2: Tokens de API -->
      <v-window-item v-if="myProfile.role === 'dev'" value="api-tokens">
        <router-view />
      </v-window-item>
    </v-window>

    <v-dialog v-model="confirmPictureRemoval" max-width="420">
      <v-card title="Eliminar imagen de perfil">
        <v-card-text>¿Quieres volver a mostrar las iniciales en lugar de tu imagen?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmPictureRemoval = false">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" @click="removeProfilePicture">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { extractTime } from '../../helpers/utils.js';
import { useMyProfile } from '../../composables/docugen-web/useMyProfile.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';
import { DIALOGS } from '../../constants/dialogs.js';

const route = useRoute();
const router = useRouter();
const { myProfile, actions: myProfile_actions, success: myProfile_success } = useMyProfile();
const myAccountStore = useMyAccountStore();
const profilePictureInput = ref(null);
const confirmPictureRemoval = ref(false);
const profilePictureLoading = ref(false);
const dialogBoxStore = useDialogBoxStore();
const notificationStore = useNotificationStore();
const accountId = computed(() => myAccountStore.getMyAccount.id);
const profilePictureData = computed(() => myProfile.value?.user?.profilePicture?.data || '');
const userInitials = computed(() =>
  myProfile.value?.username ? myProfile.value.username.slice(0, 2).toUpperCase() : 'NA'
);

// Tab management
const activeTab = ref('info');

const handleTabChange = (tab) => {
  activeTab.value = tab;
  if (tab === 'api-tokens') {
    router.push({ name: 'my-profile-api-tokens' });
  } else {
    router.push({ name: 'my-profile' });
  }
};

watch(
  () => route.path,
  (newPath) => {
    activeTab.value = newPath.includes('api-tokens') ? 'api-tokens' : 'info';
  },
  { immediate: true }
);

onMounted(() => {
  activeTab.value = route.path.includes('api-tokens') ? 'api-tokens' : 'info';
});

const dialogBoxDataSet = {
  setUsername: DIALOGS.docugen_web.management.set_username,
  setPassword: DIALOGS.docugen_web.management.set_password,
  default: DIALOGS.default,
};

const cardInfo = computed(() => {
  return [
    { label: 'Nombre de usuario', key: 'username', data: myProfile.value?.username || '' },
    { label: 'Nombre', key: 'name', data: myProfile.value?.user?.name || '' },
    { label: 'Apellido', key: 'lastname', data: myProfile.value?.user?.lastname || '' },
    { label: 'Contraseña', key: 'password', data: '*****' || '' },
    { label: 'Email', key: 'email', data: myProfile.value?.user?.email || '' },
    { label: 'Rol', key: 'role', data: profileRole(myProfile.value.role).text },
  ];
});

const profileStatus = (status) => {
  return {
    color:
      status === 'active'
        ? 'success'
        : status === 'suspended'
          ? 'warning'
          : status === 'inactive'
            ? 'error'
            : 'info',
  };
};

const profileRole = (role) => {
  return {
    text: role === 'admin' ? 'Administrador' : role === 'dev' ? 'Desarrollador' : '',
  };
};

const profileUpdateTime = computed(() => {
  const updatedTime = extractTime(myProfile.value.updatedAt, 'America/La_Paz', 'long');
  return {
    date: updatedTime.date,
    hour: updatedTime.hour,
  };
});

const onProfilePictureSelected = async (event) => {
  const [imageFile] = event.target.files || [];
  event.target.value = '';
  if (!imageFile) return;

  profilePictureLoading.value = true;
  try {
    await myProfile_actions.profilePictureSetter(accountId.value, imageFile);
  } finally {
    profilePictureLoading.value = false;
  }
};

const removeProfilePicture = async () => {
  confirmPictureRemoval.value = false;
  profilePictureLoading.value = true;
  try {
    await myProfile_actions.profilePictureRemover(accountId.value);
  } finally {
    profilePictureLoading.value = false;
  }
};

const setValue = async (itemKey) => {
  let dialogBoxData = {};
  let exitDialog = false;
  switch (itemKey) {
    case 'username': {
      dialogBoxData = dialogBoxDataSet.setUsername;
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
            const newUsername = response.parameters.find((p) => p.key === 'newUsername').value;
            const payload = { username: newUsername };
            await myProfile_actions.myProfileSetter(accountId.value, { data: payload });
          }
        } else if (response.key === 'n') {
          exitDialog = true;
        } else {
          exitDialog = false;
        }
        dialogBoxStore.resolveDialogBoxProcedure(exitDialog);
      } while (!exitDialog);
      break;
    }
    case 'password': {
      dialogBoxData = dialogBoxDataSet.setPassword;
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
            const newPass = response.parameters.find((p) => p.key === 'newPass').value;
            const payload = { password: newPass };
            await myProfile_actions.myProfileSetter(accountId.value, { data: payload });
          }
        } else if (response.key === 'n') {
          exitDialog = true;
        } else {
          exitDialog = false;
        }
        dialogBoxStore.resolveDialogBoxProcedure(exitDialog);
      } while (!exitDialog);
      break;
    }
    default: {
      dialogBoxData = dialogBoxDataSet.default;
    }
  }
};

onMounted(async () => {
  await myProfile_actions.myProfileGetter(accountId.value);
});
</script>

<style scoped></style>
