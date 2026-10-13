<template>
  <v-card rounded="lg" elevation="2">
    <!-- Title -->
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-database-outline"></v-icon>
      </template>
      <v-card-title> {{ systemParameter.alias }}</v-card-title>
    </v-card-item>
    <!-- Review info -->
    <v-card-item>
      <v-list density="compact">
        <v-list-item>
          <div>
            <span class="font-weight-bold">Estado: </span>
            <v-chip size="small" :color="status(systemParameter.status).color" variant="flat">{{
              status(systemParameter.status).text
            }}</v-chip>
          </div>
        </v-list-item>
      </v-list>
    </v-card-item>
    <v-divider></v-divider>
    <!-- Chart Info -->
    <v-card-item>
      <h3 class="text-center">Gráfico uso de Almacenamiento usado de Base de Datos</h3>
      <div class="chart-wrapper"><Line :data="chartData" :options="chartOptions" /></div>
      <div class="d-flex justify-center align-center ga-3 mt-4">
        <v-btn
          icon="mdi-chevron-left"
          aria-label="Ver datos más antiguos"
          variant="tonal"
          :disabled="loading || !pagination.hasNextPage"
          @click="$emit('page-change', pagination.page + 1)"
        />
        <span class="text-caption text-center">{{ rangeLabel }}</span>
        <v-btn
          icon="mdi-chevron-right"
          aria-label="Ver datos más recientes"
          variant="tonal"
          :disabled="loading || !pagination.hasPrevPage"
          @click="$emit('page-change', pagination.page - 1)"
        />
      </div>
      <div v-if="!chartData.labels.length" class="text-center text-medium-emphasis mt-2">
        No hay datos válidos disponibles para este período.
      </div>
    </v-card-item>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { extractTime } from '../../helpers/utils.js';
import { Line } from 'vue-chartjs';
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
  systemParameter: {
    type: Object,
    required: true,
    default: () => {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['page-change']);

const pagination = computed(
  () =>
    props.systemParameter.pagination || {
      page: 1,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
    }
);

const validValues = computed(() =>
  (props.systemParameter.values || []).filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      Number.isFinite(Number(item.value)) &&
      item.createdAt
  )
);

const formatTimestamp = (timestamp) => {
  const time = extractTime(timestamp, 'America/La_Paz', 'short2');
  return `${time.date} ${time.hour}`.trim();
};

const rangeLabel = computed(() => {
  if (!validValues.value.length) return 'Sin datos';
  const first = formatTimestamp(validValues.value[0].createdAt);
  const last = formatTimestamp(validValues.value[validValues.value.length - 1].createdAt);
  return first === last ? first : `${first} – ${last}`;
});

const status = (itemStatus) => {
  return {
    color: itemStatus === 'followed' ? 'success' : itemStatus === 'unfollowed' ? 'error' : 'info',
    text:
      itemStatus === 'followed'
        ? 'Monitoreando'
        : itemStatus === 'unfollowed'
          ? 'No monitoreado'
          : 'Sin estado',
  };
};

// Chart Data
const chartData = computed(() => {
  return {
    labels: validValues.value.map((item) => formatTimestamp(item.createdAt)),
    datasets: [
      {
        label: 'Espacio usado (MB)',
        backgroundColor: '#1867C0',
        borderRadius: 4,
        data: validValues.value.map((item) => Number(item.value)),
      },
    ],
  };
});

// Chart Metadata
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `Tamaño: ${context.raw} MB`,
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
      title: { display: true, text: 'Megabytes (MB)' },
    },
  },
};
</script>

<style scoped>
.chart-wrapper {
  height: 400px;
  width: 100%;
}
</style>
