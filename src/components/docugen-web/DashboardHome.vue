<template>
  <!-- Current date -->
  <v-row>
    <v-col class="d-flex align-center justify-end" cols="12">
      <div class="text-h6 font-weight-light">
        {{ extractTime(time, 'America/La_Paz', 'long').date }}
      </div>
    </v-col>
  </v-row>
  <!-- Activities -->
  <v-row> </v-row>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTime } from '../../composables/utils/useTime.js';
import { extractTime } from '../../helpers/utils.js';

const { time, actions: time_actions, loading: time_loading, success: time_success } = useTime();

onMounted(async () => {
  await time_actions.getTime();
});
</script>

<style scoped></style>
