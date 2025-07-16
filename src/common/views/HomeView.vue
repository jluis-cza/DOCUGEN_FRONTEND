<script setup>
import { useCounterStore } from '../stores/counterStore';
const counter = useCounterStore();
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Welcome to Docugen</h1>
        <p>This is the home view of the Docugen application.</p>
        <p>
          {{ counter.states.vector }}
        </p>
      </v-col>
    </v-row>
    <RouterLink to="/login">Sing In</RouterLink>

    <RouterLink to="/register">Sing Up</RouterLink>

    <RouterLink to="/counter">Counter</RouterLink>
  </v-container>
</template>
<style scoped></style>
