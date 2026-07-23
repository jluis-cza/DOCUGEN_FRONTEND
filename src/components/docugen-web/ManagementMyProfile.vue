<template>
  <!-- Profile info -->
  <v-card>
    <!-- Title -->
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-account"></v-icon>
      </template>
      <template #append>
        <v-icon
          icon="mdi-circle"
          size="small"
          :color="profileStatus(myProfile.status).color"
        ></v-icon>
      </template>
      <v-card-title>Mi perfil</v-card-title>
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
      </v-list>
    </v-card-item>
    <!-- profile update date -->
    <v-card-item>
      <p class="text-caption text-secondary text-right">
        Última actualización el {{ profileUpdateTime.date }} a las {{ profileUpdateTime.hour }}.
      </p>
    </v-card-item>
  </v-card>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { extractTime } from '../../helpers/utils.js';
import { useMyProfile } from '../../composables/docugen-web/useMyProfile.js';
import { useMyPassword } from '../../composables/docugen-web/useMyPassword.js';
import { useMyUsername } from '../../composables/docugen-web/useMyUsername.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useDialogBoxStore } from '../../stores/utils/dialogBoxStore.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';
import { useMyUsernameStore } from '../../stores/docugen-web/myUsernameStore.js';
import { DIALOGS } from '../../constants/dialogs.js';

const { myProfile, actions: myProfile_actions, success: myProfile_success } = useMyProfile();
const { actions: myPassword_actions, success: myPassword_success } = useMyPassword();
const { actions: myUsername_actions, success: myUsername_success } = useMyUsername();
const myAccountStore = useMyAccountStore();
const dialogBoxStore = useDialogBoxStore();
const notificationStore = useNotificationStore();
const myUsernameStore = useMyUsernameStore();
const accountId = computed(() => myAccountStore.getMyAccount.id);
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
  const updatedTime = extractTime(myProfile.value.updatedAt, 'America/La_Paz', 'long')
  return {
    date: updatedTime.date,
    hour: updatedTime.hour,
  };
});

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
