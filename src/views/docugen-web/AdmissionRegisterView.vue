<template>
  <v-container>
    <v-card class="mx-auto" max-width="400" :loading="loading" variant="elevated">
      <v-card-title> Registro </v-card-title>
      <v-form ref="form" validate-on="submit lazy" @submit.prevent="register">
        <v-card-text>
          <v-text-field
            v-model="registryData.username"
            label="Nombre de usuario"
            autocomplete="username"
            :rules="[RULE_TEXT_REQUIRED, RULE_USERNAME_INPUT]"
            required
            hint="El nombre de usuario debe empezar con una letra. No se permiten puntos, guiones consecutivos. No puede terminar con punto o guión. Debe tener 3-20 caracteres (letras, números, . _ -)"
          >
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
            hint="Mínimo 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales."
          >
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
  </v-container>
</template>
<script setup>
import { RULES } from '../../helpers/rules.js';
import { SERVICES } from '../../constants/services.js';
import { ref } from 'vue';
import { useAccount } from '../../composables/docugen-web/useAccount.js';
import { useRouter } from 'vue-router';
const registryDefaultData = SERVICES.payload.docugen_web.admission.account_registry;
const registryData = ref(JSON.parse(JSON.stringify(registryDefaultData)));
const passwordConfirmation = ref('');
const form = ref(null);
const showPassword = ref(false);
const RULE_TEXT_REQUIRED = RULES.text.input.required;
const RULE_EMAIL_INPUT = RULES.text.input.email;
const RULE_USERNAME_INPUT = RULES.text.input.username;
const RULE_PASSWORD_INPUT = RULES.text.input.password;
const RULE_PASSWORD_MATCH = RULES.text.input.match(
  () => registryData.value.password,
  'Las contraseñas'
);
const router = useRouter();
const { actions, loading, success } = useAccount();

const register = async () => {
  try {
    const { valid } = await form.value.validate();
    if (valid) {
      await actions.accountRegister(registryData.value);
      if (success.value) {
        registryData.value = registryDefaultData; //cleaning form
        passwordConfirmation.value = ''; //cleaning field
        await router.push('/'); // Redirecting to home
      }
    }
  } catch (error) {
    console.error('Error in registry process.', error.message);
    throw error;
  }
};
</script>
<style scoped></style>
