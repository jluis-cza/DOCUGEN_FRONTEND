<template>
  <v-card height="601.13" class="d-flex flex-column">
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-history"></v-icon>
      </template>
      <v-card-title>Historial de actividades</v-card-title>
      <v-card-subtitle>Mis actividades</v-card-subtitle>
    </v-card-item>
    <v-divider></v-divider>
    <v-card-text class="flex-grow-1 overflow-y-auto overflow-x-auto">
      <div v-for="(section, index) in myProcessesStore.getMyDateSegmentedProcesses" :key="index">
        <!-- Date -->
        <div class="text-center font-weight-light text-no-wrap">
          <span>
            {{ section.date }}
          </span>
        </div>
        <!-- Daily processes -->
        <v-timeline side="end" density="comfortable" line-thickness="2">
          <v-timeline-item
            v-for="(myProcess, pIndex) in section.myProcesses"
            :key="pIndex"
            :dot-color="myProcessSuccess(myProcess.success).color"
            :icon="myProcessSuccess(myProcess.success).icon"
            size="small"
          >
            <v-card
              variant="tonal"
              density="compact"
              :color="myProcessSuccess(myProcess.success).color"
            >
              <div class="d-flex justify-space-between align-center pa-3 ">
                <div class="text-body-2  font-weight-medium pr-6">
                  {{ myProcess.name }}
                </div>
                <div class="text-caption  font-weight-light text-no-wrap">
                  {{ extractTime(myProcess.createdAt, 'America/La_Paz', 'long').hour }}
                </div>
              </div>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useMyProcessesStore } from '../../stores/docugen-web/myProcessesStore.js';
import { useMyProcesses } from '../../composables/docugen-web/useMyProcesses.js';
import { extractTime } from '../../helpers/utils.js';

const props = defineProps({
  account: {
    type: Object,
    required: true,
    default: () => {},
  },
});

const {
  myProcesses,
  actions: myProcesses_actions,
  loading: myProcesses_loading,
  success: myProcesses_success,
} = useMyProcesses();

const myProcessesStore = useMyProcessesStore();

const params = {
  associated_account: props.account.id,
};

const myProcessSuccess = (success) => {
  return {
    color: success ? 'success' : 'error',
    icon: success ? 'mdi-check' : 'mdi-close',
  };
};

onMounted(async () => {
  await myProcesses_actions.myProcessesGetter(params);
});
</script>

<style scoped></style>
