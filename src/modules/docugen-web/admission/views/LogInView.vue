<script setup>
import { ref } from 'vue';
import { RULES } from '@/common/constants/rules';

const credentials = ref({
  email: '',
  password: '',
});
const form = ref(null);

const signin = async () => {
  try {
    // Checking mistakes in imput data
    const { valid } = await form.value.validate();
    if (valid) {
      console.log({ valid: valid });
      console.log('It is sending data to the Server');
    } else {
      console.log('Input data is incorrect.');
    }
  } catch (error) {
    console.error('The entry could not have been verificated.', error);
  }
  // Saving public credentials in local storage

  // Eliciting Token
};
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Sign In</h1>
        <p>Please enter your credentials to sign in.</p>
        <v-form ref="form" validate-on="submit lazy" @submit.prevent="signin">
          <v-text-field
            v-model="credentials.email"
            label="Email"
            type="email"
            :rules="[RULES.input.email, RULES.input.required]"
          ></v-text-field>
          <v-text-field
            v-model="credentials.password"
            label="Password"
            type="password"
            :rules="[RULES.input.required]"
          ></v-text-field>
          <v-btn color="primary" type="submit">Sign In</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped></style>
