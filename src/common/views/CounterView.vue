<script setup>
import { useCounterStore } from '../stores/counterStore';

const counter = useCounterStore();
console.log({ counter: counter });
// console.log({viteVariables: [import.meta.env.VITE_API_URL, import.meta.env.USER_TOKEN ]})
</script>
<template>
  <v-card>
    <v-card-item>
      <v-card-title> Contador </v-card-title>
    </v-card-item>
    <v-card-text>
      <h3>Estado</h3>
      <p>count: {{ counter.states.count }}</p>
      <p>vector: {{ counter.states.vector }}</p>
    </v-card-text>
    <v-card-text>
      <h3>Getters</h3>
      <p>count: count: {{ counter.getters.count }}</p>
      <p>count: doubleCount: {{ counter.getters.doubleCount }}</p>
    </v-card-text>
    <v-card-actions>
      <h3>Acciones</h3>
      <v-btn @click="counter.actions.increment"> increment</v-btn>
      <v-btn @click="counter.actions.decrement"> decrement</v-btn>
      <v-btn @click="counter.actions.addElement"> addElement</v-btn>
    </v-card-actions>
    <RouterLink to="/">home</RouterLink>
  </v-card>
</template>
<style scoped></style>
