<template>
  <v-app>
    <v-app-bar class="welcome-app-bar px-3 bg-primary">
      <v-app-bar-title>DOCUGEN</v-app-bar-title>
      <v-spacer> </v-spacer>
      <template v-if="isLoggedIn">
        <v-btn @click="goToDashboard" class="welcome-nav-button">Ir al dashboard</v-btn>
      </template>
      <template v-else>
        <v-btn @click="goToLogin" class="welcome-nav-button">Iniciar Sesión</v-btn>
        <v-btn @click="goToRegistry" class="welcome-nav-button bg-success">Registrarse</v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row justify="center" align="center" class="welcome-hero">
          <v-col cols="12" md="4" class="welcome-copy">
            <div>
              <h1>Bienvenido a DOCUGEN</h1>
              <p>Diseñe, edite y genere documentos personalizados</p>
            </div>
          </v-col>
          <v-col cols="12" md="8">
            <v-carousel cycle class="welcome-carousel">
              <v-carousel-item
                v-for="(item, i) in items"
                :key="i"
                :src="getImageUrl(item.src)"
                cover
              >
              </v-carousel-item>
            </v-carousel>
          </v-col>
        </v-row>
        <v-row justify="center" align="center">
          <p class="my-5 welcome-description">
            DOCUGEN es una herramienta que asiste al diseño y generación de documentos. Puede editar
            sus plantillas documentales en el editor grafico, colocar imagenes, texto y otros
            elementos. Genere documentos personalizados incluyendo los datos deseados en la
            plantillas a traves de una interfaz API.
          </p>
        </v-row>
      </v-container>
    </v-main>
    <footer class="text-center bg-secondary welcome-footer">
      <p>DOCUGEN 2026</p>
      <div>
        <RouterLink to="/manual" style="text-decoration: none; color: inherit">Manual</RouterLink>
        |
        <RouterLink to="/information" style="text-decoration: none; color: inherit"
          >Información</RouterLink
        >
        |
        <RouterLink to="/qa" style="text-decoration: none; color: inherit">Q&amp;A</RouterLink>
      </div>
      <p>Diseñado por JL</p>
    </footer>
  </v-app>
</template>
<script setup>
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useTokenStore } from '../../stores/docugen-web/tokenStore.js';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';

const router = useRouter();
const tokenStore = useTokenStore();
const myAccountStore = useMyAccountStore();
const isLoggedIn = computed(() => Boolean(tokenStore.getToken || myAccountStore.getMyAccount?.id));

const getImageUrl = (name) => {
  return new URL(`../../assets/docugen-web/${name}`, import.meta.url).href;
};
const items = [
  { src: 'editor1.png', title: 'editor' },
  { src: 'template1.png', title: 'plantilla' },
  { src: 'document1.png', title: 'documento' },
];

const goToLogin = () => {
  router.push('/login');
};
const goToRegistry = () => {
  router.push('/register');
};
const goToDashboard = () => {
  router.push('/dashboard');
};
</script>
<style scoped>
.welcome-carousel {
  height: clamp(220px, 42vw, 420px) !important;
}

.welcome-description {
  max-width: 960px;
}

@media (max-width: 600px) {
  .welcome-app-bar {
    padding-inline: 8px !important;
  }

  .welcome-app-bar :deep(.v-toolbar__content) {
    gap: 4px;
  }

  .welcome-app-bar :deep(.v-toolbar-title) {
    min-width: 0;
    font-size: 1rem;
  }

  .welcome-nav-button {
    min-width: 0;
    margin-inline: 0;
    padding-inline: 8px;
    font-size: 0.75rem;
  }

  .welcome-copy {
    text-align: center;
  }

  .welcome-copy h1 {
    font-size: 1.75rem;
  }

  .welcome-carousel {
    height: 220px !important;
  }

  .welcome-footer {
    padding: 12px;
  }
}
</style>
