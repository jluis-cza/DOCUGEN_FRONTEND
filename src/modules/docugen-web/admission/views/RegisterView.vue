<script setup></script>
<template>
  <v-container>
    <h1>Sign Up</h1>
    <p>Please enter yout Data.</p>
    <v-form>
      <v-text-field label="Name" type="name" required></v-text-field>
      <v-text-field label="Lastname" type="lastname" required></v-text-field>
      <v-text-field label="Email" type="email" required></v-text-field>
      <v-text-field label="Password" type="password" required></v-text-field>

      <v-btn color="primary" type="submit">Sign Up</v-btn>
    </v-form>
  </v-container>
</template>
<style scoped></style>
