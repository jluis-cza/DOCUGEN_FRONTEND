<template>
  <!-- Current date -->
  <v-row>
    <v-col class="d-flex align-center justify-end" cols="12">
      <div class="text-h6 font-weight-light">
        {{ extractTime(time, 'America/La_Paz', 'long').date }}
      </div>
    </v-col>
  </v-row>
  <v-row>
    <!-- Time Charts -->
    <v-col cols="8"> </v-col>
    <!-- Activities -->
    <v-col cols="4">
      <v-card>
        <v-card-title> Actividades </v-card-title>
        <v-divider></v-divider>
        <div class="timeline-area">
          <template v-for="(section, index) in processesStore.getDateProcesses" :key="index">
            <!-- Date -->
            <div class="text-center">
              <span>
                {{ section.date }}
              </span>
            </div>
            <!-- Daily processes -->
            <v-timeline side="end" density="comfortable" line-thickness="2">
              <v-timeline-item
                v-for="(process, index) in section.processes"
                :key="index"
                :dot-color="processSuccess(process.success).color"
                :icon="processSuccess(process.success).icon"
                size="small"
              >
                <v-card>
                  <v-card-item>
                    <template #append>
                      <span class="text-caption">
                        {{ extractTime(process.createdAt, 'America/La_Paz', 'long').hour }}
                      </span>
                    </template>
                    <v-card-text class="text-body-1"> {{ process.name }}</v-card-text>
                  </v-card-item>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </template>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useMyAccountStore } from '../../stores/docugen-web/myAccountStore.js';
import { useProcessesStore } from '../../stores/utils/processesStore.js';
import { useTime } from '../../composables/utils/useTime.js';
import { useProcesses } from '../../composables/utils/useProcesses.js';
import { extractTime } from '../../helpers/utils.js';

const { time, actions: time_actions, loading: time_loading, success: time_success } = useTime();
const {
  processes,
  actions: processes_actions,
  loading: processes_loading,
  success: processes_success,
} = useProcesses();

const myAccountStore = useMyAccountStore();
const processesStore = useProcessesStore();
const accountId = computed(() => myAccountStore.getMyAccount.id);

const params = {
  associated_account: accountId.value,
};

// const sections = computed(()=> activitie)
const processSuccess = (success) => {
  return {
    color: success ? 'success' : 'error',
    icon: success ? 'mdi-check' : 'mdi-close',
  };
};

onMounted(async () => {
  await time_actions.serverTimeGetter();
  console.log({ params });
  await processes_actions.processesGetter(params);
});
</script>

<style scoped>
.timeline-area {
  overflow-y: auto;
  padding: 16px 16px 16px;
  max-height: 500px;
}
</style>
