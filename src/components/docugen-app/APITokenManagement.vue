<template>
  <div class="api-tokens-container">
    <!-- Header -->
    <div class="tokens-header mb-4">
      <h1 class="text-h4 font-weight-bold">Mis Tokens de API</h1>
      <p class="text-caption text-medium-emphasis mt-2">
        Gestiona tokens independientes para acceso programático a la API
      </p>
    </div>

    <!-- Create Token Button -->
    <div class="mb-4">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
        Crear Nuevo Token
      </v-btn>
    </div>

    <!-- Tokens Table -->
    <v-card class="elevation-1">
      <v-table v-if="tokens.length > 0" density="comfortable">
        <thead>
          <tr>
            <th class="text-left">Nombre</th>
            <th class="text-left">Token</th>
            <th class="text-left">Creado</th>
            <th class="text-left">Último Uso</th>
            <th class="text-left">Usos</th>
            <th class="text-center">Acciones</th>
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
              <v-btn
                icon="mdi-eye"
                variant="text"
                size="small"
                @click="viewTokenDetails(token.id)"
              />
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="editToken(token)" />
              <v-btn
                icon="mdi-lock"
                variant="text"
                size="small"
                color="warning"
                @click="confirmRevoke(token)"
                v-if="token.status === 'active'"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(token)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>

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
        <v-card-title class="bg-primary text-white">
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
              v-model="newToken.scopes"
              :items="availableScopes"
              label="Permisos"
              multiple
              hint="Qué puede hacer este token"
              persistent-hint
            />
          </div>

          <div class="mb-4">
            <v-checkbox v-model="enableExpiration" label="Este token debe expirar en:" />
            <v-select
              v-if="enableExpiration"
              v-model="newToken.expiresIn"
              :items="expirationOptions"
              label="Tiempo de expiración"
              class="mt-2"
            />
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
          <v-btn color="primary" @click="handleCreateToken" :loading="loading"> Crear Token </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Token Generated Dialog (Show Once) -->
    <v-dialog v-model="showTokenDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-success text-white">
          <v-icon icon="mdi-check-circle" class="mr-2" />
          Token Creado Exitosamente
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="warning" class="mb-4" icon="mdi-alert" variant="tonal">
            <div class="text-subtitle-2 font-weight-bold mb-2">⚠️ COPIA TU TOKEN AHORA</div>
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
              <v-btn icon="mdi-content-copy" @click="copyToClipboard(generatedToken.token)" />
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
        <v-card-title>Editar Token</v-card-title>

        <v-card-text class="pa-6">
          <v-text-field v-model="editingToken.name" label="Nombre" />
          <v-textarea v-model="editingToken.description" label="Descripción" rows="2" />
          <v-select
            v-model="editingToken.scopes"
            :items="availableScopes"
            label="Permisos"
            multiple
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="handleUpdateToken" :loading="loading">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Revoke Dialog -->
    <v-dialog v-model="showRevokeConfirm" max-width="400">
      <v-card>
        <v-card-title class="bg-warning">
          <v-icon icon="mdi-alert-circle" class="mr-2" />
          Revocar Token
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="mb-4">
            ¿Está seguro que desea revocar <strong>{{ tokenToRevoke?.name }}</strong
            >?
          </p>
          <p class="text-caption text-medium-emphasis">
            Este token ya no funcionará. Cualquier aplicación que lo use dejará de funcionar.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showRevokeConfirm = false">Cancelar</v-btn>
          <v-btn color="warning" @click="handleRevokeToken" :loading="loading"> Sí, Revocar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title class="bg-error text-white">
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
          <v-btn variant="text" @click="showDeleteConfirm = false">Cancelar</v-btn>
          <v-btn color="error" @click="handleDeleteToken" :loading="loading"> Sí, Eliminar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAPITokens } from '@/composables/docugen-app/useAPITokens.js';
import { useNotificationStore } from '@/stores/utils/notificationStore.js';

const {
  tokens,
  loading,
  success,
  message,
  code,
  getTokens,
  createToken,
  updateToken,
  revokeToken,
  deleteToken,
} = useAPITokens();
const notificationStore = useNotificationStore();

// UI state
const showCreateDialog = ref(false);
const showTokenDialog = ref(false);
const showEditDialog = ref(false);
const showRevokeConfirm = ref(false);
const showDeleteConfirm = ref(false);

// Form data
const newToken = ref({
  name: '',
  description: '',
  scopes: ['documents:generate'],
  expiresIn: null,
});

const generatedToken = ref(null);
const editingToken = ref(null);
const tokenToRevoke = ref(null);
const tokenToDelete = ref(null);
const enableExpiration = ref(false);
const formErrors = ref({});

// Constants
const availableScopes = [
  { title: 'Generar Documentos', value: 'documents:generate' },
  { title: 'Leer Documentos', value: 'documents:read' },
  { title: 'Leer Plantillas', value: 'templates:read' },
  { title: 'Escribir Plantillas', value: 'templates:write' },
  { title: 'Acceso Completo', value: 'api:full' },
];

const expirationOptions = [
  { title: '30 días', value: '30d' },
  { title: '90 días', value: '90d' },
  { title: '1 año', value: '1y' },
  { title: 'Nunca', value: null },
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
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleCreateToken = async () => {
  formErrors.value = {};

  if (!newToken.value.name.trim()) {
    formErrors.value.name = 'El nombre es requerido';
    return;
  }

  try {
    const response = await createToken({
      name: newToken.value.name,
      description: newToken.value.description,
      scopes: newToken.value.scopes,
      expiresAt: newToken.value.expiresIn ? calculateExpiration(newToken.value.expiresIn) : null,
    });

    const createdToken = normalizeCreatedToken(response);
    generatedToken.value = createdToken;
    showCreateDialog.value = false;
    showTokenDialog.value = true;

    notificationStore.showNotification({
      message: 'Token creado exitosamente',
      type: 'success',
      duration: 'short',
      code: 'S3001',
    });
  } catch (error) {
    notificationStore.showNotification({
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
  if (expiresIn === '90d') now.setDate(now.getDate() + 90);
  if (expiresIn === '1y') now.setFullYear(now.getFullYear() + 1);
  return expiresIn ? now : null;
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  notificationStore.showNotification({
    message: 'Token copiado al portapapeles',
    type: 'success',
    duration: 'short',
  });
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
      scopes: editingToken.value.scopes,
    });

    showEditDialog.value = false;
    notificationStore.showNotification({
      message: 'Token actualizado exitosamente',
      type: 'success',
      duration: 'short',
      code: 'S3004',
    });
  } catch (error) {
    notificationStore.showNotification({
      message: error.response?.data?.message || 'Error actualizando token',
      type: 'error',
      duration: 'persistent',
    });
  }
};

const confirmRevoke = (token) => {
  tokenToRevoke.value = token;
  showRevokeConfirm.value = true;
};

const handleRevokeToken = async () => {
  try {
    await revokeToken(tokenToRevoke.value.id);
    showRevokeConfirm.value = false;
    notificationStore.showNotification({
      message: 'Token revocado exitosamente',
      type: 'success',
      duration: 'short',
      code: 'S3005',
    });
  } catch (error) {
    notificationStore.showNotification({
      message: error.response?.data?.message || 'Error revocando token',
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
    notificationStore.showNotification({
      message: 'Token eliminado exitosamente',
      type: 'success',
      duration: 'short',
      code: 'S3006',
    });
  } catch (error) {
    notificationStore.showNotification({
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
    scopes: ['documents:generate'],
    expiresIn: null,
  };
  enableExpiration.value = false;
  clearErrors();
};

const viewTokenDetails = async (tokenId) => {
  // Aquí podrías mostrar más detalles del token
  console.log('View token details:', tokenId);
};

// Lifecycle
onMounted(() => {
  getTokens();
});
</script>

<style scoped>
.api-tokens-container {
  padding: 24px;
}

.tokens-header {
  border-bottom: 1px solid var(--v-border-color);
  padding-bottom: 16px;
}

.font-family-monospace {
  font-family: 'Courier New', monospace;
}
</style>
