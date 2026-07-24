<template>
  <v-container class="w-100 h-100 d-flex flex-column">
    <!-- Home link -->
    <div>
      <RouterLink to="/">Ir a la página de inicio</RouterLink>
    </div>
    <!-- Form -->
    <div class="flex-grow-1 d-flex align-center justify-center">
      <v-card class="mx-auto" width="400" :loading="loading" variant="elevated">
        <v-card-title> Registro </v-card-title>
        <v-form ref="form" validate-on="submit lazy" @submit.prevent="register">
          <v-card-text>
            <v-text-field
              v-model="registryData.username"
              label="Nombre de usuario"
              autocomplete="username"
              :rules="[RULE_TEXT_REQUIRED, RULE_USERNAME_INPUT]"
              required
            >
              <template #append-inner>
                <v-tooltip
                  location="bottom"
                  text="El nombre de usuario debe empezar con una letra. No se permiten puntos, guiones consecutivos. No puede terminar con punto o guión. Debe tener 3-20 carácteres (letras, números, . _ -)"
                >
                  <template #activator="{ props }">
                    <v-icon v-bind="props" icon="mdi-information-outline"></v-icon>
                  </template>
                </v-tooltip>
              </template>
            </v-text-field>
            <v-text-field
              v-model="registryData.user.name"
              label="Nombres"
              :rules="[RULE_TEXT_REQUIRED]"
              required
            ></v-text-field>
            <v-text-field
              v-model="registryData.user.lastname"
              label="Apellidos"
              :rules="[RULE_TEXT_REQUIRED]"
              required
            ></v-text-field>
            <v-text-field
              v-model="registryData.user.email"
              label="Correo"
              type="email"
              autocomplete="email"
              :rules="[RULE_TEXT_REQUIRED, RULE_EMAIL_INPUT]"
              required
            ></v-text-field>
            <v-text-field
              v-model="registryData.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :rules="[RULE_TEXT_REQUIRED, RULE_PASSWORD_INPUT]"
              required
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            >
              <template #append-inner>
                <v-tooltip location="bottom" text="Mínimo 8 carácteres.">
                  <template #activator="{ props }">
                    <v-icon class="mr-2" v-bind="props" icon="mdi-information-outline"></v-icon>
                  </template>
                </v-tooltip>
              </template>
            </v-text-field>
            <v-text-field
              v-model="passwordConfirmation"
              label="Reingrese la contraseña"
              type="password"
              autocomplete="new-password"
              :rules="[RULE_TEXT_REQUIRED, RULE_PASSWORD_MATCH]"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit">Registrar cuenta</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useMyAccount } from '../../composables/docugen-web/useMyAccount.js';
import { SERVICES } from '../../constants/services.js';
import { RULES } from '../../helpers/rules.js';

// ************* Constants and Variables *************
// Default values
const registryDefaultData = SERVICES.payload.docugen_web.admission.register_account;
const router = useRouter();
const { actions, loading, success } = useMyAccount();
// Layout
const registryData = ref(JSON.parse(JSON.stringify(registryDefaultData)));
const passwordConfirmation = ref('');
const form = ref(null);
const showPassword = ref(false);
// Rules
const RULE_TEXT_REQUIRED = RULES.text.input.required;
const RULE_EMAIL_INPUT = RULES.text.input.email;
const RULE_USERNAME_INPUT = RULES.text.input.username;
const RULE_PASSWORD_INPUT = RULES.text.input.password;
const RULE_PASSWORD_MATCH = RULES.text.input.match(
  () => registryData.value.password,
  'Las contraseñas'
);

// ************* Functions *************
const register = async () => {
  try {
    const { valid } = await form.value.validate();
    if (valid) {
      await actions.myAccountRegister(registryData.value);
      if (success.value) {
        registryData.value = registryDefaultData; //cleaning form
        passwordConfirmation.value = ''; //cleaning field
        await router.push('/'); // Redirecting to the welcome page
      }
    }
  } catch (error) {
    console.error('Error in registry process.', error.message);
    throw error;
  }
};
</script>
<style scoped></style>
