<!-- <template>
  <v-snackbar
    v-model="isShowing"
    timeout="10000"
    width="700"
    color="transparent"
    variant="flat"
    location="right bottom"
    transition="fade-transition"
  >
    <v-card variant="elevated">
      <v-card-item :class="notificationData.color">
        <v-card-title>
          {{ notificationData.title}}
        </v-card-title>
        <v-spacer />
      </v-card-item>
      <v-card-text class="text-justify pt-4 bg-background">
        {{ notificationData.message }}
      </v-card-text>
    </v-card>
  </v-snackbar>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useNotificationStore } from '../stores/notificationStore.js'
import { NOTIFICATION } from '../constants/notifications.js'

const isShowing = ref(false)
const notification = useNotificationStore()
const notificationData = ref()

const isOpenAlert = computed(() => store.getters['alertas/isAlertOpen'])
// control de la ventana
const cerrarVentana = () => {
  isShowing.value = false
  store.dispatch('alertas/closeAlert')
}
//Computando las propiedades locales de color e icon
const notification = computed(() => {
  let icon = ''
  let color = ''
  switch (alert.value.type) {
    case SUCCESS:
      icon = 'mdi-check-circle'
      color = 'bg-success'
      break
    case WARNING:
      icon = 'mdi-alert-circle'
      color = 'bg-warning'
      break
    case ERROR:
      icon = 'mdi-close-circle'
      color = 'bg-error'
      break
    case INFO:
      icon = 'mdi-information'
      color = 'bg-info'
      break
    default:
      icon = 'mdi-information'
      color = 'bg-info'
      break
  }
  return { icon: icon, color: color }
})

</script> -->
