<template>
  <v-card rounded="lg" elevation="2">
    <!-- Title -->
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-clock-time-nine-outline"></v-icon>
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
      <h3 class="text-center">Gráfico tiempo de uso del sistema</h3>
      <div class="chart-wrapper"><Line :data="chartData" :options="chartOptions" /></div>
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
    labels: props.systemParameter.values.map((item) => {
      return (
        extractTime(item.createdAt, 'America/La_Paz', 'short2').date +
        extractTime(item.createdAt, 'America/La_Paz', 'short2').hour
      );
    }),
    datasets: [
      {
        label: 'Tiempo de uso (Horas)',
        backgroundColor: '#1867C0',
        borderRadius: 4,
        data: props.systemParameter.values.map((item) => parseFloat(item.value)),
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
        label: (context) => `Tiempo: ${context.raw} Horas`,
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
      title: { display: true, text: 'Horas' },
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
