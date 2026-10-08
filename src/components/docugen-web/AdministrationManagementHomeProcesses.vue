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
    <v-card-text class="flex-grow-1 overflow-hidden">
      <v-infinite-scroll height="470" :items="timelineProcesses" side="end" @load="onLoad">
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
              v-for="myProcess in section.myProcesses"
              :key="myProcess._id"
              :dot-color="myProcessSuccess(myProcess.success).color"
              :icon="myProcessSuccess(myProcess.success).icon"
              size="small"
            >
              <v-card
                variant="tonal"
                density="compact"
                :color="myProcessSuccess(myProcess.success).color"
              >
                <div class="d-flex justify-space-between align-center pa-3">
                  <div class="text-body-2 font-weight-medium pr-6">
                    {{ myProcess.name }}
                  </div>
                  <div class="text-caption font-weight-light text-no-wrap">
                    {{ extractTime(myProcess.createdAt, 'America/La_Paz', 'long').hour }}
                  </div>
                </div>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </div>
        <template #empty>
          <div class="text-center text-caption text-medium-emphasis py-2">
            No hay más actividades
          </div>
        </template>
        <template #error>
          <div class="text-center text-caption text-error py-2">
            {{ myProcesses_message }}
          </div>
        </template>
      </v-infinite-scroll>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
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
  timelineProcesses,
  actions: myProcesses_actions,
  message: myProcesses_message,
} = useMyProcesses();

const myProcessesStore = useMyProcessesStore();

const params = {
  associated_account: props.account.id,
};
const PAGE_SIZE = 5;
const cursor = ref(null);
const hasNextChunk = ref(true);
const isLoading = ref(false);

const onLoad = async ({ done }) => {
  if (isLoading.value) {
    done('ok');
    return;
  }
  if (!hasNextChunk.value) {
    done('empty');
    return;
  }

  isLoading.value = true;
  try {
    const metadata = await myProcesses_actions.myProcessesGetter({
      ...params,
      cursor: cursor.value,
      limit: PAGE_SIZE,
    });
    cursor.value = metadata.cursor ?? null;
    hasNextChunk.value = metadata.hasNextChunk ?? false;
    done(hasNextChunk.value ? 'ok' : 'empty');
  } catch (error) {
    console.error('Error loading process history.', error);
    done('error');
  } finally {
    isLoading.value = false;
  }
};

const myProcessSuccess = (success) => {
  return {
    color: success ? 'success' : 'error',
    icon: success ? 'mdi-check' : 'mdi-close',
  };
};

onMounted(() => {
  myProcessesStore.resetTimelineProcesses();
  cursor.value = null;
  hasNextChunk.value = true;
});
</script>

<style scoped></style>
