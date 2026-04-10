<template>
  <v-app>
    <v-app-bar class="px-3 bg-primary">
      <v-app-bar-title>DOCUGEN</v-app-bar-title>
      <v-spacer> </v-spacer>
      <v-btn @click="goToLogin" class="mx-5">Iniciar Sesión</v-btn>
      <v-btn @click="goToRegistry" class="bg-success">Registrarse</v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row justify="center" align="center">
          <v-col cols="4">
            <div>
              <h1>Bienvenido a DOCUGEN</h1>
              <p>Diseñe, edite y genere documentos personalizados</p>
            </div>
          </v-col>
          <v-col cols="8">
            <v-carousel cycle>
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
          <p class="my-5">
            DOCUGEN es una herramienta que asiste al diseño y generación de documentos. Puede editar
            sus plantillas documentales en el editor grafico, colocar imagenes, texto y otros
            elementos. Genere documentos personalizados incluyendo los datos deseados en la
            plantillas a traves de una interfaz API.
          </p>
        </v-row>
      </v-container>
    </v-main>
    <footer class="text-center bg-secondary">
      <p>DOCUGEN 2026</p>
      <div>
        <RouterLink to="/manual" style="text-decoration: none; color: inherit">Ayuda</RouterLink>
        |
        <RouterLink to="/information" style="text-decoration: none; color: inherit"
          >Acerca</RouterLink
        >
      </div>
      <p>Diseñado por JL</p>
    </footer>
  </v-app>
</template>
<script setup>
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();
const getImageUrl = (name) => {
  return new URL(`../assets/docugen-web/${name}`, import.meta.url).href;
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
</script>
<style scoped></style>
