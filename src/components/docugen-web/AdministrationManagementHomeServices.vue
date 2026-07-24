<template>
  <v-card>
    <!-- Title -->
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-cogs"></v-icon>
      </template>
      <v-card-title>Servicios</v-card-title>
      <v-card-subtitle>Monitoreo de módulos de Edición y Generación</v-card-subtitle>
    </v-card-item>

    <v-divider></v-divider>

    <!-- Panels -->
    <!-- two panels (cols=6) -->
    <v-card-item>
      <v-row dense>
        <v-col cols="6" v-for="(panel, pIndex) in panels" :key="pIndex">
          <v-card
            variant="tonal"
            color="primary"
            class="count-panel d-flex flex-column justify-center align-center text-center"
          >
            <div class="count-panel_counter">
              {{ panel.counter }}
            </div>
            <div class="count-panel_description">{{ panel.description }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-item>

    <v-divider></v-divider>

    <!-- Charts -->
    <v-card-item>
      <v-row dense v-for="(chart, cIndex) in charts" :key="cIndex">
        <v-col cols="12" class="overflow-y-auto overflow-x-auto">
          <v-card variant="outlined" width="100%" min-width="500">
            <v-card-title class="text-center text-subtitle-1">{{ chart.title }}</v-card-title>
            <v-card-item>
              <Line :data="chart.data" :options="chartOptions" />
            </v-card-item>
            <!-- <v-card-actions class="d-flex justify-space-between align-center">
              <v-btn
                size="small"
                variant="plain"
                @click=""
                icon="mdi-skip-previous"
              >
              </v-btn>
              <v-btn
                size="small"
                variant="plain"
                @click="incOffset(1)"
                icon="mdi-chevron-left"
              >
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                size="small"
                variant="plain"
                @click="incOffset(-1)"
                icon="mdi-chevron-right"
              >
              </v-btn>
              <v-btn size="small"  variant="plain" @click="" icon="mdi-skip-next">
              </v-btn>
            </v-card-actions> -->
          </v-card>
        </v-col>
      </v-row>
    </v-card-item>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { useProcesses } from '../../composables/docugen-web/useProcesses.js';
import { useProcessesStore } from '../../stores/docugen-web/processesStore.js';
import { useMyProcesses } from '../../composables/docugen-web/useMyProcesses.js';
import { useMyProcessesStore } from '../../stores/docugen-web/myProcessesStore.js';
import { extractTime } from '../../helpers/utils.js';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);
const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
});
const {
  processes,
  actions: processes_actions,
  loading: processes_loading,
  success: processes_success,
} = useProcesses();
const {
  myProcesses,
  actions: myProcesses_actions,
  loading: myProcesses_loading,
  success: myProcesses_success,
} = useMyProcesses();
const processesStore = useProcessesStore();
const myProcessesStore = useMyProcessesStore();
const dateOffset = ref({
  edition: 0,
  processing: 0,
});

// Functions
const getCurrentDate = () => {
  const currentTime = new Date();
  return extractTime(currentTime.toISOString(), 'America/La_Paz', 'numeric').date;
};
const getHistoricalProcessesCounting = (module) => {
  if (!module) throw new Error('No module argument provided.');
  let data = {};
  let dataset = [];
  if (props.account.role === 'admin') {
    dataset = processesStore.getHistoricalProcessesCountingWindow(module, dateOffset.value[module]);
  }
  if (props.account.role === 'dev') {
    dataset = myProcessesStore.getMyHistoricalProcessesCountingWindow(
      module,
      dateOffset.value[module]
    );
  }
  data.x = dataset.map((e) => e.date);
  data.y = dataset.map((e) => e.count);
  return data;
};
const getTodayProcessesCount = (module) => {
  if (!module) throw new Error('No module argument provided.');
  let count = 0;
  if (props.account.role === 'admin') {
    count = processesStore.getProcessesCount(module, getCurrentDate());
  }
  if (props.account.role === 'dev') {
    count = myProcessesStore.getMyProcessesCount(module, getCurrentDate());
  }
  return count;
};

// Chart Data
const chartData = (xArray, yArray) => {
  if (!xArray || !yArray) throw new Error('No dataset provided.');
  return {
    labels: xArray,
    datasets: [
      {
        label: 'Uso diario',
        backgroundColor: '#1867C0',
        borderRadius: 4,
        data: yArray,
      },
    ],
  };
};
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `Llamadas al servicio: ${context.raw}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: true },
      ticks: { maxRotation: 45, minRotation: 45 },
    },
    y: {
      beginAtZero: false,
      title: { display: true, text: 'Uso de servicio' },
    },
  },
};

// Layout
const panels = computed(() => {
  return [
    {
      counter: getTodayProcessesCount('edition'),
      description: 'Ediciones de plantilla hechas hoy',
    },
    {
      counter: getTodayProcessesCount('processing'),
      description: 'Generaciones de documentos hechas hoy',
    },
  ];
});
const charts = computed(() => {
  return [
    {
      title: 'Historial de uso del módulo de Edición de Plantillas',
      data: chartData(
        getHistoricalProcessesCounting('edition').x,
        getHistoricalProcessesCounting('edition').y
      ),
    },
    {
      title: 'Historial de uso del módulo de Generación de Documentos',
      data: chartData(
        getHistoricalProcessesCounting('processing').x,
        getHistoricalProcessesCounting('processing').y
      ),
    },
  ];
});

// Hooks
onMounted(async () => {
  if (props.account.role === 'admin')
    await processes_actions.processesGetter({ requestedModules: ['edition', 'processing'] });
  // if (props.account.role === 'dev' && myProcesses_success === null)
  if (props.account.role === 'dev')
    await myProcesses_actions.myProcessesGetter({ associated_account: props.account.id });
});
</script>

<style scoped>
.count-panel {
  min-height: 80px;
  border-radius: 12px;
}
.count-panel_counter {
  font-weight: 600;
  font-size: 1.6rem;
  line-height: 1.2;
}
.count-panel_description {
  font-size: 0.8rem;
}
</style>
