<!-- This view is part of the Administration and Management modules of DOCUGEN-->
<template>
  <v-app>
    <!-- NavBar -->
    <v-app-bar color="primary" elevation="2" height="56">
      <!-- NavBar logo -->
      <template #prepend>
        <v-app-bar-nav-icon color="white" @click="drawerOpen = !drawerOpen"> </v-app-bar-nav-icon>
      </template>
      <v-app-bar-title class="text-white font-weight-semibold"> DOCUGEN </v-app-bar-title>
      <!-- NavBar menu -->
      <template #append>
        <div class="d-flex align-center ga-3 mr-2">
          <v-avatar color="surface">
            <span class="text-primary font-weight-bold text-caption">{{ userInitials }}</span>
          </v-avatar>
          <v-menu
            v-model="accountMenuOpen"
            :close-on-content-click="false"
            location="bottom end"
            offset="20"
            transition="fade-transition"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                variant="text"
                color="white"
                size="x-small"
                density="comfortable"
              >
                <v-icon :icon="accountMenuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
              </v-btn>
            </template>
            <v-card min-width="240" rounded="lg" elevation="3">
              <v-card-item>
                <template #prepend>
                  <v-avatar color="surface">
                    <span class="text-primary font-weight-bold text-caption">{{
                      userInitials
                    }}</span>
                  </v-avatar>
                </template>
                <v-card-title> {{ myUsername }} </v-card-title>
                <v-card-subtitle>
                  <v-chip size="small" outlined>{{ myAccount.role }}</v-chip>
                </v-card-subtitle>
              </v-card-item>
              <v-divider />
              <v-list density="compact" nav>
                <v-list-item
                  prepend-icon="mdi-account-outline"
                  title="Mi Perfil"
                  rounded="lg"
                  @click="openMyProfile"
                />
              </v-list>
              <v-divider />
              <v-card-actions class="pa-2">
                <v-btn
                  color="error"
                  variant="tonal"
                  prepend-icon="mdi-logout"
                  size="small"
                  block
                  @click="logout"
                >
                  Cerrar Sesión
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </div>
      </template>
    </v-app-bar>
    <!-- Drawer nav -->
    <v-navigation-drawer
      v-model="drawerOpen"
      :permanent="true"
      color="surface"
      border="end"
      width="240"
    >
      <v-list nav density="compact" class="px-2 pt-3" v-model:selected="selectedItem">
        <v-list-item
          to="/dashboard/home"
          value="/dashboard/home"
          exact
          prepend-icon="mdi-home"
          title="Inicio"
          color="primary"
          rounded="lg"
        />
        <template v-if="myAccount.role === administrator">
          <v-divider class="py-1"></v-divider>
          <v-list-subheader class="text-uppercase ls-wide"> Administración </v-list-subheader>
          <v-list-item
            to="/dashboard/system"
            value="/dashboard/system"
            prepend-icon="mdi-cog-outline"
            title="Parámetros del Sistema"
            color="primary"
            rounded="lg"
          />
          <v-list-item
            to="/dashboard/accounts"
            value="/dashboard/accounts"
            prepend-icon="mdi-account-multiple"
            title="Cuentas"
            color="primary"
            rounded="lg"
          />
          <v-list-item
            to="/dashboard/services"
            value="/dashboard/services"
            prepend-icon="mdi-cogs"
            title="Servicios"
            color="primary"
            rounded="lg"
          />
        </template>
        <template v-if="myAccount.role === developer">
          <v-divider class="py-1"></v-divider>
          <v-list-subheader class="text-uppercase ls-wide"> Gestión </v-list-subheader>
          <v-list-item
            to="/dashboard/templates"
            value="/dashboard/templates"
            prepend-icon="mdi-file-document-outline"
            title="Gestor de Plantillas"
            color="primary"
            rounded="lg"
          />
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid class="pa-7">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useMySession } from '../../composables/docugen-web/useMySession.js';
import { useMyUsername } from '../../composables/docugen-web/useMyUsername.js';
import { USERS } from '../../constants/users.js';

// General values
const router = useRouter();
const route = useRoute();
const myAccountStore = useMyAccountStore();
const { actions: mySession_actions } = useMySession();
const {myUsername, actions: myUsername_actions} = useMyUsername()
const administrator = USERS.type.server.role.administrator;
const developer = USERS.type.client.role.developer;
// Layout values
const myAccount = computed(()=> myAccountStore.getMyAccount)

const drawerOpen = ref(true);
const accountMenuOpen = ref(false);
const userInitials = computed(() =>
  myUsername.value ? myUsername.value.slice(0, 2).toUpperCase() : 'NA'
);
const selectedItem = ref([]); //Default view

const logout = async () => {
  try {
    await mySession_actions.mySessionCloser({ id: myAccount.value.id });
    await router.push('/');
  } catch (error) {
    console.log('Error in logout process. ', error.message);
    throw error;
  }
};

const openMyProfile = async () => {
  accountMenuOpen.value = false;
  selectedItem.value = [];
  try {
    await router.push('/dashboard/my-profile');
  } catch (error) {
    console.log('Error in going to the my profile page. ', error.message);
    throw error;
  }
};
onMounted(async() => {
  await myUsername_actions.usernameGetter({id: myAccount.value.id || ''})
});
</script>

<style scoped>
.ls-wide {
  letter-spacing: 1.5px;
}
</style>
