<template>
  <div class="api-tokens-container">
    <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
      <h1 class="text-h5 font-weight-bold">Mis Tokens de API</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
        Crear Nuevo Token
      </v-btn>
    </div>

    <!-- Tokens Table -->
    <v-card class="elevation-1">
      <v-card-text v-if="!hasLoadedTokens" class="pa-8">
        <v-progress-linear indeterminate color="primary" class="mb-4" />
        <div class="text-center text-caption text-medium-emphasis">Cargando tokens...</div>
      </v-card-text>

      <div v-else-if="tokens.length > 0" class="tokens-table-container">
        <v-table class="tokens-table" density="comfortable">
          <thead>
            <tr>
              <th class="text-left bg-accent font-weight-bold">Nombre</th>
              <th class="text-left bg-accent font-weight-bold">Token</th>
              <th class="text-left bg-accent font-weight-bold">Creado</th>
              <th class="text-left bg-accent font-weight-bold">Último Uso</th>
              <th class="text-left bg-accent font-weight-bold">Usos</th>
              <th class="text-center bg-accent font-weight-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.id">
              <td>
                <div>
                  <div class="font-weight-bold">{{ token.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ token.description }}</div>
                </div>
              </td>
              <td>
                <v-chip size="small" variant="outlined" class="font-family-monospace">
                  {{ token.token_preview }}
                </v-chip>
              </td>
              <td>
                <div class="text-caption">
                  {{ formatDate(token.createdAt) }}
                </div>
              </td>
              <td>
                <div v-if="token.lastUsedAt" class="text-caption">
                  {{ formatDate(token.lastUsedAt) }}
                  <div v-if="token.lastUsedIp" class="text-caption text-medium-emphasis">
                    {{ token.lastUsedIp }}
                  </div>
                </div>
                <div v-else class="text-caption text-disabled">Nunca</div>
              </td>
              <td>
                <v-chip size="small" color="info" variant="tonal">
                  {{ token.accessCount }}
                </v-chip>
              </td>
              <td class="text-center">
                <div class="d-flex justify-center ga-1">
                  <v-btn
                    prepend-icon="mdi-pencil"
                    variant="tonal"
                    size="small"
                    @click="editToken(token)"
                  >
                    Editar
                  </v-btn>
                  <v-btn
                    prepend-icon="mdi-delete"
                    variant="tonal"
                    size="small"
                    color="error"
                    @click="confirmDelete(token)"
                  >
                    Eliminar
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <v-card-text v-else-if="tokensLoadError" class="text-center pa-8">
        <v-icon size="48" class="mb-4 text-error">mdi-alert-circle-outline</v-icon>
        <div class="text-subtitle-2 text-error">No se pudieron cargar los tokens</div>
        <div class="text-caption text-medium-emphasis mb-4">
          Comprueba tu conexión e inténtalo nuevamente.
        </div>
        <v-btn size="small" color="primary" @click="loadTokens">Reintentar</v-btn>
      </v-card-text>

      <v-card-text v-else class="text-center pa-8">
        <v-icon size="48" class="mb-4 text-disabled">mdi-key-link</v-icon>
        <div class="text-subtitle-2 text-disabled">No hay tokens creados</div>
        <div class="text-caption text-disabled mb-4">
          Crea tu primer token para acceder a la API programáticamente
        </div>
        <v-btn size="small" color="primary" @click="showCreateDialog = true">
          Crear Token Ahora
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Create Token Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-plus" class="mr-2" />
          Crear Nuevo Token de API
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-4">
            <v-text-field
              v-model="newToken.name"
              label="Nombre del Token"
              hint="ej: Facturación App, Mobile App"
              persistent-hint
              placeholder="Mi Aplicación"
              @update:model-value="clearErrors"
            />
            <div v-if="formErrors.name" class="text-caption text-error mt-1">
              {{ formErrors.name }}
            </div>
          </div>

          <div class="mb-4">
            <v-textarea
              v-model="newToken.description"
              label="Descripción (opcional)"
              rows="2"
              hint="Describe qué aplicación usará este token"
              persistent-hint
              placeholder="Aplicación para generar facturas desde el sistema contable"
            />
          </div>

          <div class="mb-4">
            <v-select
              v-model="newToken.expiresIn"
              :items="expirationOptions"
              item-title="title"
              item-value="value"
              label="Tiempo de expiración *"
              class="mt-2"
              :rules="[(value) => Boolean(value) || 'Selecciona un tiempo de expiración.']"
              required
              hide-details="auto"
              @update:model-value="formErrors.expiresIn = ''"
            />
            <div v-if="formErrors.expiresIn" class="text-caption text-error mt-1">
              {{ formErrors.expiresIn }}
            </div>
          </div>

          <v-alert type="info" class="mb-4" icon="mdi-information" variant="tonal">
            <div class="text-caption">
              <strong>Importante:</strong> El token solo se muestra una sola vez. Cópialo y guárdalo
              en un lugar seguro.
            </div>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeCreateDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="handleCreateToken"
            :loading="loading"
            :disabled="loading || !newToken.expiresIn"
          >
            Crear Token
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Token Generated Dialog (Show Once) -->
    <v-dialog v-model="showTokenDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-check-circle" class="mr-2" />
          Token Creado Exitosamente
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="warning" class="mb-4" icon="mdi-alert" variant="tonal">
            <div class="text-subtitle-2 font-weight-bold mb-2">COPIA TU TOKEN AHORA</div>
            <div class="text-caption">
              Este es el último momento que verás tu token. No se puede recuperar después.
            </div>
          </v-alert>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-2">Tu Token de API:</div>
            <div class="d-flex align-center gap-2">
              <v-text-field
                :model-value="generatedToken.token"
                readonly
                variant="outlined"
                class="font-family-monospace"
              />
              <v-btn
                icon="mdi-content-copy"
                aria-label="Copiar token"
                @click="copyToClipboard(generatedToken.token)"
              />
            </div>
          </div>

          <div class="bg-surface rounded pa-3 mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Uso del Token:</div>
            <div class="font-family-monospace text-caption">
              curl -H "Authorization: Bearer {{ generatedToken.token }}" \<br />
              https://api.docugen.com/api/app/documents/generate
            </div>
          </div>

          <v-alert type="info" class="mb-4" icon="mdi-lock" variant="tonal">
            <div class="text-caption">
              <strong>Seguridad:</strong> Nunca compartas tu token. Si lo comprometes, revócalo
              inmediatamente.
            </div>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="primary" @click="showTokenDialog = false"> Entendido, Continuar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Token Dialog -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-pencil" class="mr-2" />
          Editar Token
        </v-card-title>

        <v-card-text class="pa-6">
          <v-text-field v-model="editingToken.name" label="Nombre" />
          <v-textarea v-model="editingToken.description" label="Descripción" rows="2" />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="tonal" class="bg-secondary" @click="showEditDialog = false">
            Cancelar
          </v-btn>
          <v-btn variant="tonal" class="bg-primary" @click="handleUpdateToken" :loading="loading">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-delete" class="mr-2" />
          Eliminar Token
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="mb-4">
            ¿Está seguro que desea eliminar <strong>{{ tokenToDelete?.name }}</strong
            >?
          </p>
          <p class="text-caption text-medium-emphasis">Esta acción no se puede deshacer.</p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="tonal" class="bg-secondary" @click="showDeleteConfirm = false">
            Cancelar
          </v-btn>
          <v-btn variant="tonal" class="bg-primary" @click="handleDeleteToken" :loading="loading">
            Sí, Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAPITokens } from '@/composables/docugen-app/useAPITokens.js';
import { useNotificationStore } from '@/stores/utils/notificationStore.js';
import { extractTime } from '@/helpers/utils.js';

const {
  tokens,
  loading,
  success,
  message,
  code,
  getTokens,
  createToken,
  updateToken,
  deleteToken,
} = useAPITokens();
const notificationStore = useNotificationStore();
const showNotification = ({ message, type, duration, code }) => {
  notificationStore.setNotification({
    message,
    code: code || (type === 'success' ? 'S0000' : 'EXXX'),
    mode: duration === 'persistent' ? 'persistent' : 'short',
  });
};

// UI state
const showCreateDialog = ref(false);
const showTokenDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteConfirm = ref(false);
const hasLoadedTokens = ref(false);
const tokensLoadError = ref(false);

// Form data
// TODO: Add permission selection only after backend route-level scope enforcement is implemented.
const newToken = ref({
  name: '',
  description: '',
  expiresIn: '',
});

const generatedToken = ref(null);
const editingToken = ref(null);
const tokenToDelete = ref(null);
const formErrors = ref({});

const expirationOptions = [
  { title: '30 días', value: '30d' },
  { title: '90 días', value: '90d' },
  { title: '1 año', value: '1y' },
];

// Methods
const normalizeCreatedToken = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') return { token: payload };
  if (payload.token) return payload;
  if (payload.data) {
    if (typeof payload.data === 'string') return { token: payload.data };
    if (payload.data.token) return payload.data;
    if (payload.data.data) return normalizeCreatedToken(payload.data.data);
  }
  if (payload.value && typeof payload.value === 'string') return { token: payload.value };
  return payload;
};

const clearErrors = () => {
  formErrors.value = {};
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  const { date: formattedDate, hour } = extractTime(date, 'America/La_Paz', 'short2');
  return formattedDate && hour ? `${formattedDate}, ${hour.slice(0, 5)}` : 'N/A';
};

const handleCreateToken = async () => {
  formErrors.value = {};

  if (!newToken.value.name.trim()) {
    formErrors.value.name = 'El nombre es requerido';
  }
  if (!newToken.value.expiresIn) {
    formErrors.value.expiresIn = 'Selecciona un tiempo de expiración.';
  }
  if (Object.keys(formErrors.value).length) return;
  const expiresAt = calculateExpiration(newToken.value.expiresIn);
  if (!expiresAt || expiresAt <= new Date()) {
    formErrors.value.expiresIn = 'Selecciona un período de expiración válido.';
    return;
  }

  try {
    const response = await createToken({
      name: newToken.value.name,
      description: newToken.value.description,
      expiresAt,
    });

    const createdToken = normalizeCreatedToken(response);
    generatedToken.value = createdToken;
    closeCreateDialog();
    showTokenDialog.value = true;

    showNotification({
      message: 'Token creado exitosamente',
      type: 'success',
      duration: 'short',
      code: 'S3001',
    });
  } catch (error) {
    showNotification({
      message: error.response?.data?.message || 'Error creando token',
      type: 'error',
      duration: 'persistent',
      code: error.response?.data?.code || 'EXXX',
    });
  }
};

const calculateExpiration = (expiresIn) => {
  const now = new Date();
  if (expiresIn === '30d') now.setDate(now.getDate() + 30);
  else if (expiresIn === '90d') now.setDate(now.getDate() + 90);
  else if (expiresIn === '1y') now.setFullYear(now.getFullYear() + 1);
  else return null;
  return now;
};

const copyWithFallback = (text) => {
  const temporaryInput = document.createElement('textarea');
  temporaryInput.value = text;
  temporaryInput.setAttribute('readonly', '');
  temporaryInput.style.position = 'fixed';
  temporaryInput.style.opacity = '0';
  document.body.appendChild(temporaryInput);
  try {
    temporaryInput.select();
    if (!document.execCommand('copy')) {
      throw new Error('El navegador no pudo copiar el token.');
    }
  } finally {
    temporaryInput.remove();
  }
};

const copyToClipboard = async (text) => {
  try {
    if (!text) throw new Error('No hay un token disponible para copiar.');
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        copyWithFallback(text);
      }
    } else {
      copyWithFallback(text);
    }

    showNotification({
      message: 'Token copiado al portapapeles',
      type: 'success',
      duration: 'short',
    });
  } catch (error) {
    showNotification({
      message:
        error.message ||
        'No se pudo copiar el token. Selecciónalo manualmente y cópialo de forma segura.',
      type: 'error',
      duration: 'persistent',
    });
  }
};

const editToken = (token) => {
  editingToken.value = { ...token };
  showEditDialog.value = true;
};

const handleUpdateToken = async () => {
  try {
    await updateToken(editingToken.value.id, {
      name: editingToken.value.name,
      description: editingToken.value.description,
    });

    showEditDialog.value = false;
    showNotification({
      message: 'Token actualizado exitosamente',
      type: 'success',
      duration: 'short',
      code: 'S3004',
    });
  } catch (error) {
    showNotification({
      message: error.response?.data?.message || 'Error actualizando token',
      type: 'error',
      duration: 'persistent',
    });
  }
};

const confirmDelete = (token) => {
  tokenToDelete.value = token;
  showDeleteConfirm.value = true;
};

const handleDeleteToken = async () => {
  try {
    await deleteToken(tokenToDelete.value.id);
    showDeleteConfirm.value = false;
    showNotification({
      message: 'Token eliminado exitosamente',
      type: 'success',
      duration: 'short',
      code: 'S3006',
    });
  } catch (error) {
    showNotification({
      message: error.response?.data?.message || 'Error eliminando token',
      type: 'error',
      duration: 'persistent',
    });
  }
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
  newToken.value = {
    name: '',
    description: '',
    expiresIn: '',
  };
  clearErrors();
};

const loadTokens = async () => {
  hasLoadedTokens.value = false;
  tokensLoadError.value = false;
  try {
    await getTokens();
  } catch (error) {
    tokensLoadError.value = true;
    showNotification({
      message: error.response?.data?.message || 'No se pudieron cargar los tokens de API.',
      type: 'error',
      duration: 'persistent',
      code: error.response?.data?.code || 'EXXX',
    });
  } finally {
    hasLoadedTokens.value = true;
  }
};

// Lifecycle
onMounted(loadTokens);
</script>

<style scoped>
.api-tokens-container {
  padding: 24px;
}

.font-family-monospace {
  font-family: 'Courier New', monospace;
}

.tokens-table-container {
  max-width: 100%;
  overflow-x: auto;
}

.tokens-table :deep(table) {
  min-width: 1000px;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .api-tokens-container {
    padding: 12px;
  }
}
</style>
