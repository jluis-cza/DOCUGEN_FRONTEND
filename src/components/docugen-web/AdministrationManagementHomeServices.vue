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
        <v-col cols="12" sm="6" v-for="(panel, pIndex) in panels" :key="pIndex">
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
              <div class="chart-wrapper">
                <Line :data="chart.data" :options="chartOptions" />
              </div>
            </v-card-item>
            <v-card-actions class="d-flex justify-center align-center ga-3">
              <v-btn
                size="small"
                variant="tonal"
                icon="mdi-chevron-left"
                aria-label="Ver datos más antiguos"
                :disabled="historyLoading || !usageHistory?.pagination?.hasOlder"
                @click="loadUsageHistory((usageHistory?.pagination?.page || 1) + 1)"
              />
              <span class="text-caption text-center">{{ rangeLabel }}</span>
              <v-btn
                size="small"
                variant="tonal"
                icon="mdi-chevron-right"
                aria-label="Ver datos más recientes"
                :disabled="historyLoading || !usageHistory?.pagination?.hasNewer"
                @click="loadUsageHistory(usageHistory.pagination.page - 1)"
              />
            </v-card-actions>
            <v-card-item v-if="historyError">
              <v-alert type="error" variant="tonal" density="compact">{{ historyError }}</v-alert>
            </v-card-item>
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
import { useMyProcesses } from '../../composables/docugen-web/useMyProcesses.js';
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
const { actions: processes_actions } = useProcesses();
const { actions: myProcesses_actions } = useMyProcesses();
const usageHistory = ref(null);
const todayCounts = ref({ edition: 0, processing: 0 });
const historyLoading = ref(false);
const historyError = ref('');

const formatDate = (date) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const rangeLabel = computed(() => {
  const pagination = usageHistory.value?.pagination;
  if (!pagination) return 'Cargando historial…';
  return `${formatDate(pagination.startDate)} – ${formatDate(pagination.endDate)}`;
});

const loadUsageHistory = async (page = 1) => {
  historyLoading.value = true;
  historyError.value = '';
  try {
    const history =
      props.account.role === 'admin'
        ? await processes_actions.processUsageHistoryGetter({ page })
        : await myProcesses_actions.myProcessUsageHistoryGetter({ page });
    usageHistory.value = history;
    if (history.todayCounts) todayCounts.value = history.todayCounts;
  } catch (error) {
    historyError.value =
      error.response?.data?.message || error.message || 'No fue posible cargar el historial.';
  } finally {
    historyLoading.value = false;
  }
};

// Chart Data
const chartData = (module) => {
  const days = usageHistory.value?.days || [];
  return {
    labels: days.map(({ date }) => formatDate(date)),
    datasets: [
      {
        label: 'Uso diario',
        backgroundColor: '#1867C0',
        borderRadius: 4,
        data: days.map((day) => day[module]),
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
      beginAtZero: true,
      title: { display: true, text: 'Uso de servicio' },
    },
  },
};

// Layout
const panels = computed(() => {
  return [
    {
      counter: todayCounts.value.edition,
      description: 'Uso del módulo de Edición hoy',
    },
    {
      counter: todayCounts.value.processing,
      description: 'Uso del módulo de Generación hoy',
    },
  ];
});
const charts = computed(() => {
  return [
    {
      title: 'Historial de uso del módulo de Edición de Plantillas',
      data: chartData('edition'),
    },
    {
      title: 'Historial de uso del módulo de Generación de Documentos',
      data: chartData('processing'),
    },
  ];
});

// Hooks
onMounted(async () => {
  await loadUsageHistory(1);
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
.chart-wrapper {
  height: 260px;
  position: relative;
  width: 100%;
}
</style>
