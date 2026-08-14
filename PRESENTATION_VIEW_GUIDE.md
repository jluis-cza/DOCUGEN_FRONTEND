# GUÍA TÉCNICA DETALLADA - Interface de Configuración/Presentación

## 📚 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Composables y Stores](#composables-y-stores)
3. [Componente Principal](#componente-principal)
4. [Flujos de Datos](#flujos-de-datos)
5. [Integración Backend](#integración-backend)
6. [Ejemplos de Código](#ejemplos-de-código)
7. [Casos de Uso](#casos-de-uso)

---

## 🏗️ Arquitectura General

### Stack Tecnológico

```
Vue 3 (Composition API)
├── TemplatePresentationView.vue (Componente principal)
├── usePresentationConfig.js (Composable - lógica)
├── presentationStore.js (Pinia - estado)
└── Vuetify 3 (UI Components)
    ├── v-app-bar (topbar)
    ├── v-card (paneles)
    ├── v-text-field (campos formulario)
    ├── v-textarea (JSON editor)
    └── v-dialog (loading)
```

### Patron de Responsabilidades

```
Component (TemplatePresentationView.vue)
    ↓
    Maneja: UI, eventos, navegación
    ├── Composable (usePresentationConfig.js)
    │   ├── Maneja: Lógica de presentación
    │   ├── Extracción de placeholders
    │   ├── Validación
    │   └── Gestión de modo (form/json)
    │
    └── Service Layer (useTemplates.js)
        ├── Maneja: Comunicación HTTP
        ├── Carga de plantillas
        └── Generación de PDFs

Store (presentationStore.js)
    └── Persistencia entre vistas
```

---

## 🔧 Composables y Stores

### 1. usePresentationConfig.js

#### Funciones Utilidad (No-Reactive)

**extractPlaceholders(template)**

```javascript
// Analiza template.elements y retorna mapa de placeholders
// Input: {
//   elements: [
//     {type: 'text', text: 'Cliente: {{cliente_nombre}}', placeholderKey: null},
//     {type: 'qr', qrValue: '{{cliente_id}}'},
//     {type: 'paragraph', placeholderKey: 'empresa'}
//   ]
// }
// Output: {
//   cliente_nombre: {key, elementId, elementType: 'text', description, example},
//   cliente_id: {key, elementId, elementType: 'qr', description, example},
//   empresa: {key, elementId, elementType: 'paragraph', description, example}
// }

const extractPlaceholders = (template) => {
  const placeholderMap = {};

  template.elements.forEach((element) => {
    // Caso 1: placeholderKey definido
    if (element.placeholderKey) {
      placeholderMap[element.placeholderKey] = {
        key: element.placeholderKey,
        elementType: element.type,
      };
    }

    // Caso 2: Regex en texto - busca {{key}} patterns
    const matches = element.text?.match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g);
    if (matches) {
      matches.forEach((match) => {
        const key = match.replace(/[{}]/g, '').trim();
        placeholderMap[key] = { key, elementType: element.type };
      });
    }

    // Caso 3: Regex en qrValue
    const qrMatches = element.qrValue?.match(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g);
    if (qrMatches) {
      /* similar a Caso 2 */
    }
  });

  return placeholderMap;
};
```

**createEmptyDataObject(placeholders)**

```javascript
// Crea { cliente_nombre: '', empresa: '', ... }
// para inicializar el formulario

const createEmptyDataObject = (placeholders) => {
  const data = {};
  Object.keys(placeholders).forEach((key) => {
    data[key] = '';
  });
  return data;
};
```

**validateConfigData(data, placeholders)**

```javascript
// Retorna { isValid: boolean, errors: {key: message} }

const validateConfigData = (data, placeholders) => {
  const errors = {};

  Object.keys(placeholders).forEach((key) => {
    const placeholder = placeholders[key];

    if (placeholder.required && (!data[key] || String(data[key]).trim() === '')) {
      errors[key] = `${key} es requerido`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

#### Composable Principal

```javascript
export const usePresentationConfig = () => {
  // Refs (Estado reactivo)
  const template = ref(null); // Template cargada
  const placeholders = ref({}); // Placeholders extraídos
  const configData = ref({}); // Datos de config {key: value}
  const viewMode = ref('form'); // 'form' o 'json'
  const isGenerating = ref(false); // Loading PDF
  const pdfUrl = ref(null); // URL del PDF generado
  const validationErrors = ref({}); // {key: error_message}

  // Computed
  const placeholdersList = computed(() => Object.values(placeholders.value));

  // Methods
  const extractPlaceholdersFromTemplate = (tmpl) => {
    template.value = tmpl;
    placeholders.value = extractPlaceholders(tmpl);
    configData.value = createEmptyDataObject(placeholders.value);
  };

  const updateConfigData = (key, value) => {
    configData.value[key] = value;
    validationErrors.value[key] = null;
  };

  const setConfigDataBulk = (data) => {
    configData.value = { ...data };
    validationErrors.value = {};
  };

  const validate = () => {
    const validation = validateConfigData(configData.value, placeholders.value);
    validationErrors.value = validation.errors;
    return validation.isValid;
  };

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'form' ? 'json' : 'form';
  };

  const resetConfig = () => {
    configData.value = createEmptyDataObject(placeholders.value);
    validationErrors.value = {};
  };

  return {
    template,
    placeholders,
    configData,
    viewMode,
    isGenerating,
    pdfUrl,
    validationErrors,
    placeholdersList,
    extractPlaceholdersFromTemplate,
    updateConfigData,
    setConfigDataBulk,
    validate,
    toggleViewMode,
    resetConfig,
  };
};
```

### 2. presentationStore.js

```javascript
export const usePresentationStore = defineStore('presentation', () => {
  const currentTemplate = ref(null);
  const currentConfigData = ref({});
  const currentPdfUrl = ref(null);
  const currentViewMode = ref('form');

  // Getters (computed)
  const getTemplate = computed(() => currentTemplate.value);
  const getConfigData = computed(() => currentConfigData.value);
  const getPdfUrl = computed(() => currentPdfUrl.value);
  const getViewMode = computed(() => currentViewMode.value);

  // Actions
  const setTemplate = (template) => {
    currentTemplate.value = template;
  };

  const setConfigData = (data) => {
    currentConfigData.value = { ...data };
  };

  const setPdfUrl = (url) => {
    currentPdfUrl.value = url;
  };

  const resetPresentation = () => {
    currentTemplate.value = null;
    currentConfigData.value = {};
    currentPdfUrl.value = null;
    currentViewMode.value = 'form';
  };

  return {
    getTemplate,
    getConfigData,
    getPdfUrl,
    getViewMode,
    setTemplate,
    setConfigData,
    setPdfUrl,
    resetPresentation,
  };
});
```

---

## 📱 Componente Principal

### Estructura de Template

```html
<!-- Top Bar -->
<v-app-bar>
  <!-- Botón volver -->
  <!-- Info de plantilla -->
  <!-- Controles: Cambiar modo, Limpiar, Generar, Descargar, Cerrar -->
</v-app-bar>

<!-- Content Area -->
<v-container fluid class="presentation-body">
  <div class="presentation-layout">
    <!-- Left Panel -->
    <v-card class="config-panel">
      <v-card-title>Configuración</v-card-title>

      <!-- Form View -->
      <div v-if="viewMode === 'form'">
        <div v-for="placeholder in placeholdersList" :key="placeholder.key">
          <v-text-field
            :model-value="configData[placeholder.key]"
            :label="placeholder.key"
            :error="!!validationErrors[placeholder.key]"
            :error-messages="[validationErrors[placeholder.key]]"
            @update:model-value="(val) => updateConfigData(placeholder.key, val)"
          />
        </div>
      </div>

      <!-- JSON View -->
      <div v-else>
        <v-textarea v-model="jsonString" label="Datos (JSON)" @blur="syncJsonToData" />
      </div>

      <!-- Validation Summary -->
      <v-alert v-if="Object.keys(validationErrors).length > 0" type="warning">
        <!-- Lista de errores -->
      </v-alert>
    </v-card>

    <!-- Right Panel -->
    <v-card class="preview-panel">
      <v-card-title>Preview PDF</v-card-title>

      <div v-if="!pdfUrl" class="preview-placeholder">
        <!-- Mensaje sin PDF -->
      </div>
      <iframe v-else :src="pdfUrl" />
    </v-card>
  </div>
</v-container>

<!-- Loading Dialog -->
<v-dialog v-model="showGeneratingDialog" persistent>
  <!-- Spinner y mensaje -->
</v-dialog>
```

### Script Setup Highlights

```javascript
const route = useRoute();
const router = useRouter();
const presentationStore = usePresentationStore();
const { getTemplate, renderTemplate } = useTemplates();
const {
  template,
  placeholders,
  configData,
  viewMode,
  isGenerating,
  pdfUrl,
  validationErrors,
  extractPlaceholdersFromTemplate,
  updateConfigData,
  validate,
} = usePresentationConfig();

const templateId = computed(() => route.params.templateId);
const jsonString = ref('{}');
const jsonError = ref(null);

// Cargar al montar
onMounted(async () => {
  const tmpl = await getTemplate(templateId.value);
  extractPlaceholdersFromTemplate(tmpl);
});

// Generar PDF
const generatePdf = async () => {
  if (!validate()) return;

  isGenerating.value = true;

  try {
    const result = await renderTemplate({
      templateId: templateId.value,
      metadata: { documentName: template.value.name },
      data: configData.value,
    });

    if (result?.url) {
      pdfUrl.value = result.url;
    }
  } finally {
    isGenerating.value = false;
  }
};
```

---

## 🔄 Flujos de Datos

### Flujo 1: Carga Inicial

```
Usuario navega a /templates/:id/present
         ↓
onMounted dispara
         ↓
getTemplate(id) → HTTP GET /v1/api/app/templates/:id
         ↓
Response: {success, data: template_object}
         ↓
extractPlaceholdersFromTemplate(template)
         ↓
Analiza todos los elementos
         ↓
Construye placeholderMap: {cliente_nombre: {...}, empresa: {...}}
         ↓
Crear configData vacío: {cliente_nombre: '', empresa: ''}
         ↓
Renderizar formulario con campos
```

### Flujo 2: Edición en Modo Formulario

```
Usuario entra valor en v-text-field
         ↓
@update:model-value event
         ↓
updateConfigData('cliente_nombre', 'Luis')
         ↓
configData.value['cliente_nombre'] = 'Luis'
         ↓
validationErrors.value['cliente_nombre'] = null (limpia error)
         ↓
Vue reactivity actualiza UI:
- Muestra valor en campo
- Limpia mensaje de error
- Valida en tiempo real si campo es válido
```

### Flujo 3: Cambio a Modo JSON

```
Usuario click botón "JSON"
         ↓
toggleViewMode()
         ↓
viewMode = 'json'
         ↓
Vue renderiza: v-if="viewMode === 'json'" → true
         ↓
updateJsonString() convierte configData a JSON
         ↓
Muestra textarea con JSON pretty-printed
```

### Flujo 4: Edición JSON

```
Usuario edita textarea JSON
         ↓
jsonString.value actualiza
         ↓
@blur dispara
         ↓
syncJsonToData()
         ↓
JSON.parse(jsonString.value) → configData objeto
         ↓
setConfigDataBulk(parsed)
         ↓
Copia parsed a configData.value
         ↓
Limpia validationErrors
         ↓
Vue reactivity actualiza placeholders list
```

### Flujo 5: Generación PDF

```
Usuario click "Generar PDF"
         ↓
validate()
         ↓
Verifica que todos los campos requeridos tienen valor
         ↓
Si hay errores:
  - validationErrors.value = {key: message}
  - Retorna false
  - Button deshabilitado
         ↓
Si válido:
  generatePdf()
         ↓
  isGenerating = true
  showGeneratingDialog = true (mostrar spinner)
         ↓
  renderTemplate({
    templateId: '...',
    metadata: {documentName: '...'},
    data: {cliente_nombre: 'Luis', ...}
  })
         ↓
  POST /v1/api/app/render con payload
         ↓
  Backend:
  - Carga template de MongoDB
  - Para cada elemento, resuelve placeholders
  - Renderiza SVG a PDF con PDFKit
  - Guarda en /storage/generated/
  - Retorna {url: '/generated/...pdf'}
         ↓
  Frontend recibe response
         ↓
  pdfUrl.value = '/generated/...pdf'
         ↓
  iframe src=pdfUrl (carga PDF)
         ↓
  Botones "Regenerar" y "Descargar" ahora habilitados
         ↓
  isGenerating = false
  showGeneratingDialog = false (ocultar spinner)
```

### Flujo 6: Descargar PDF

```
Usuario click "Descargar"
         ↓
downloadPdf()
         ↓
Crear <a> element
  href = pdfUrl.value
  download = "plantilla-2.pdf"
         ↓
document.body.appendChild(link)
         ↓
link.click() → Descarga archivo
         ↓
document.body.removeChild(link)
```

---

## 🔌 Integración Backend

### Endpoint: POST /v1/api/app/render

**Request Body:**

```json
{
  "templateId": "6a7adfc8bb826861d56dd671",
  "data": {
    "cliente_nombre": "Luis González",
    "empresa": "Docugen Inc",
    "cliente_id": "CL-001",
    "fecha": "2026-08-14",
    "codigo": "DOC-2026-001"
  },
  "metadata": {
    "documentName": "Contrato Ejemplo"
  }
}
```

**Response:**

```json
{
  "success": true,
  "code": "S2006",
  "message": "Documento generado correctamente.",
  "data": {
    "url": "/generated/6a7adfc8bb826861d56dd671-1723620000000.pdf",
    "payload": {
      "template": "Contrato Ejemplo",
      "generatedAt": "2026-08-14T12:00:00.000Z",
      "documentId": "6a7adfc8bb826861d56dd671-1723620000000",
      "elementCount": 15
    }
  }
}
```

**Flujo Backend:**

1. **templateController.renderTemplate()**
   - Extrae ownerId de req.user.id (security middleware)
   - Extrae payload de req.body
   - Llama a templateService.renderTemplate()

2. **templateService.renderTemplate()**
   - Carga: `Template.findOne({_id: templateId, owner: ownerId})`
   - Validar que existe y pertenece a usuario
   - Llama a pdfRenderer.generatePdfFromTemplate()

3. **pdfRenderer.generatePdfFromTemplate()**
   - Crea nuevo PDFDocument()
   - Para cada elemento en template.elements:
     - Resuelve placeholders: `resolveTemplateString('{{cliente_nombre}}', data)`
     - Renderiza con drawElement()
   - Guarda: `/storage/generated/filename.pdf`
   - Retorna: `{url, payload}`

4. **Resolución de Placeholders (Backend):**

   ```javascript
   const resolveTemplateString = (value, payload = {}) => {
     return String(value).replace(
       /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g,
       (_, key) => payload[key] || ''
     );
   };

   // Ejemplo:
   resolveTemplateString('Cliente: {{cliente_nombre}}', { cliente_nombre: 'Luis' });
   // Retorna: 'Cliente: Luis'
   ```

---

## 💡 Ejemplos de Código

### Ejemplo 1: Agregar Campo Dinámicamente

Supongamos que template tiene:

```javascript
template.elements = [
  {
    id: 'txt-1',
    type: 'text',
    text: 'Contratante: {{cliente_nombre}}',
  },
  {
    id: 'txt-2',
    type: 'paragraph',
    placeholderKey: 'empresa',
  },
];
```

El extractPlaceholders() automáticamente genera:

```javascript
placeholders = {
  cliente_nombre: { key: 'cliente_nombre', elementId: 'txt-1', elementType: 'text' },
  empresa: { key: 'empresa', elementId: 'txt-2', elementType: 'paragraph' },
};

configData = {
  cliente_nombre: '',
  empresa: '',
};
```

### Ejemplo 2: Validar y Generar

```javascript
// En componente
const generatePdf = async () => {
  // Valida: todos los campos requeridos tienen valor
  const isValid = validate();

  if (!isValid) {
    // validationErrors.value now contains:
    // {
    //   cliente_nombre: 'cliente_nombre es requerido',
    //   empresa: 'empresa es requerido'
    // }
    console.log(validationErrors.value);
    return;
  }

  // Genera PDF con datos configurados
  const result = await renderTemplate({
    templateId: '6a7adfc8bb826861d56dd671',
    metadata: { documentName: 'Mi Documento' },
    data: {
      cliente_nombre: 'Luis',
      empresa: 'Docugen',
      ...configData.value,
    },
  });

  if (result?.url) {
    pdfUrl.value = result.url;
    // iframe ahora muestra PDF
  }
};
```

### Ejemplo 3: Sincronizar JSON ↔️ Formulario

```javascript
const jsonString = ref('{}');
const jsonError = ref(null);

// JSON → Formulario
const syncJsonToData = () => {
  try {
    const parsed = JSON.parse(jsonString.value);
    setConfigDataBulk(parsed);
    jsonError.value = null;
  } catch (error) {
    jsonError.value = `JSON inválido: ${error.message}`;
  }
};

// Formulario → JSON
watch(
  () => configData.value,
  () => {
    jsonString.value = JSON.stringify(configData.value, null, 2);
  },
  { deep: true }
);
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario No-Técnico

```
1. Abre editor de plantilla
2. Click "Configurar y Generar"
3. Ve formulario con campos amigables:
   - "cliente_nombre"
   - "empresa"
   - etc.
4. Completa campos (validación inline)
5. Click "Generar PDF"
6. Ve preview del PDF
7. Click "Descargar"
```

### Caso 2: Usuario Técnico

```
1. Click "Configurar y Generar"
2. Click botón "JSON"
3. Ve JSON completo:
   {
     "cliente_nombre": "",
     "empresa": ""
   }
4. Pega/edita JSON
5. Sincronización automática
6. Genera PDF
```

### Caso 3: Múltiples Generaciones

```
1. Carga presentación
2. Configura datos
3. Genera PDF #1
4. Regenera con otros datos
5. Genera PDF #2
6. Puede descargar ambos (PDF#1 en otra pestaña)
```

### Caso 4: Integración API

```
Frontend recibe datos de API externa:
const externalData = await fetch('/api/contratos/CL-001');
// {cliente_nombre: 'Luis', empresa: 'Acme', ...}

Luego:
setConfigDataBulk(externalData);
// Formulario auto-completa
// O genera inmediatamente
generatePdf();
```

---

## 🧪 Testing

### Pruebas Unitarias (usePresentationConfig)

```javascript
describe('usePresentationConfig', () => {
  it('extrae placeholders correctamente', () => {
    const template = {
      elements: [
        { type: 'text', text: '{{cliente_nombre}}' },
        { type: 'qr', qrValue: '{{id}}' },
        { type: 'paragraph', placeholderKey: 'empresa' },
      ],
    };

    const placeholders = extractPlaceholders(template);
    expect(Object.keys(placeholders)).toContain('cliente_nombre');
    expect(Object.keys(placeholders)).toContain('id');
    expect(Object.keys(placeholders)).toContain('empresa');
  });

  it('valida campos requeridos', () => {
    const validation = validateConfigData(
      { cliente_nombre: '', empresa: 'Acme' },
      {
        cliente_nombre: { required: true },
        empresa: { required: true },
      }
    );

    expect(validation.isValid).toBe(false);
    expect(validation.errors.cliente_nombre).toBeTruthy();
  });
});
```

### Pruebas de Integración (Componente)

```javascript
describe('TemplatePresentationView', () => {
  it('carga plantilla al montar', async () => {
    const wrapper = mount(TemplatePresentationView, {
      props: { route: { params: { templateId: '123' } } },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.vm.template).toBeTruthy();
    expect(wrapper.vm.placeholders).toBeTruthy();
  });

  it('habilita generación solo con campos completos', async () => {
    // ...setup

    expect(wrapper.vm.generarPdfBtn.disabled).toBe(true); // Sin datos

    await wrapper.vm.updateConfigData('cliente_nombre', 'Luis');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.generarPdfBtn.disabled).toBe(false); // Con datos
  });
});
```

---

## 📊 Diagrama de Estado

```
┌─────────────────────────────────┐
│     PRESENTATION INITIAL        │
│  (Template Cargada, Sin Datos)  │
├─────────────────────────────────┤
│ template: {...}                 │
│ configData: {key: ''}           │
│ pdfUrl: null                    │
│ viewMode: 'form'                │
│ validationErrors: {}            │
└──────────────┬──────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
  FORM VIEW        JSON VIEW
  (editar campos)  (editar JSON)
       │                │
       └───────┬────────┘
               │
       ┌───────▼──────────┐
       │  VALIDATION      │
       │  ERROR STATE     │
       │ (campos vacíos)  │
       └───────┬──────────┘
               │
       ┌───────▼──────────┐
       │  VALIDATION OK   │
       │  (todos completos)
       └───────┬──────────┘
               │
       ┌───────▼──────────┐
       │   GENERATING     │
       │   (Loading PDF)  │
       └───────┬──────────┘
               │
       ┌───────▼──────────┐
       │  PDF READY       │
       │  (Preview listo) │
       └──────────────────┘
```

---

## 🔐 Consideraciones de Seguridad

1. **Owner-scoped queries**: Backend valida que template pertenece al usuario
2. **Token validation**: Security middleware en GET /templates/:id
3. **Data sanitization**: Backend resuelve placeholders sin inyección
4. **File permissions**: PDFs guardados en /storage/generated/ privado
5. **Input validation**: Frontend valida JSON antes de enviar
6. **CORS headers**: API response con headers correctos

---

Este documento cubre la implementación completa, flujos, y patrones de la interfaz de Configuración/Presentación.
