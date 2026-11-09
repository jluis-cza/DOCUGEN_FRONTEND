<template>
  <v-container fluid class="py-12">
    <v-container class="pa-0" max-width="900">
      <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mb-8">
        Volver al inicio
      </v-btn>
      <h1 class="text-center">Manual</h1>
    </v-container>

    <v-container class="pa-0" max-width="900">
      <v-card id="edicion-plantillas" class="mb-6" elevation="1">
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-file-document-edit-outline" color="primary" />
          </template>
          <v-card-title>Edición de plantillas</v-card-title>
        </v-card-item>

        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            El editor permite diseñar el contenido y la página de una plantilla visualmente. Para
            abrirlo, entra en <strong>Dashboard → Gestor de Plantillas</strong> y pulsa
            <strong>Ver</strong> en la fila de la plantilla que quieras editar. La vista del editor
            tiene una barra superior, una biblioteca de elementos a la izquierda, el lienzo al
            centro y paneles de propiedades/parámetros a la derecha.
          </p>

          <div class="text-subtitle-2 font-weight-bold mb-2">1) Configurar la página</div>
          <p class="text-body-2 mb-2">
            Haz clic en una zona vacía del lienzo para deseleccionar elementos y mostrar
            <strong>Propiedades de página</strong>. Ahí puedes editar el nombre de clave de la
            plantilla, su descripción, el color de fondo, los márgenes superior/derecho/inferior/
            izquierdo y el estado. El ancho y el alto aceptan valores entre 100 y 5000 px; los
            márgenes se expresan también en píxeles.
          </p>
          <p class="text-body-2 mb-4">
            La barra del lienzo permite mostrar/ocultar la cuadrícula y las guías de márgenes,
            acercar o alejar el zoom, restablecer la vista y activar el modo para desplazar la hoja.
            Estas guías ayudan a diseñar y no se imprimen como contenido.
          </p>

          <div class="text-subtitle-2 font-weight-bold mb-2">
            2) Agregar, mover y eliminar elementos
          </div>
          <p class="text-body-2 mb-2">
            En la pestaña <strong>Elementos</strong> del panel izquierdo, haz clic en un tipo para
            insertarlo en su posición inicial o arrástralo al lugar deseado del lienzo. Hay
            elementos de texto (texto, título, subtítulo, párrafo, lista y pie), dinámicos (campo
            dinámico, imagen y QR), y gráficos/auxiliares (fecha, firma, línea, caja, tabla, casilla
            y número de página).
          </p>
          <ul class="mb-4 pl-6 text-body-2">
            <li>
              Selecciona un elemento en el lienzo; arrástralo para moverlo y usa los tiradores para
              cambiar su tamaño.
            </li>
            <li>
              El panel <strong>Propiedades</strong> permite ajustar posición X/Y, ancho, alto y,
              según el tipo, texto, color, tipografía, alineación, rotación, opacidad y bordes.
            </li>
            <li>
              Para duplicar, bloquear/desbloquear, cambiar el orden visual o eliminar, abre el menú
              contextual del elemento; también puedes usar el botón <strong>Eliminar</strong> del
              panel de propiedades.
            </li>
            <li>
              Los botones <strong>Deshacer</strong> y <strong>Rehacer</strong> de la barra superior
              permiten recorrer cambios recientes.
            </li>
          </ul>

          <div class="text-subtitle-2 font-weight-bold mb-2">
            3) Configurar parámetros dinámicos
          </div>
          <p class="text-body-2 mb-2">
            Abre la pestaña <strong>Parámetros</strong> del panel derecho para añadir un parámetro,
            cambiar su clave, etiqueta del formulario, descripción, tipo, valores permitidos o
            marcarlo como requerido. Los valores permitidos se escriben separados por comas.
          </p>
          <p class="text-body-2 mb-4">
            Para vincular un parámetro al contenido, selecciona el elemento y usa el icono de enlace
            junto al parámetro. También puedes escribir un placeholder como
            <code v-pre>{{ clave }}</code> en el texto. Las claves deben ser únicas y contener solo
            letras, números, punto, guion o guion bajo; <code>page_number</code> está reservado. El
            tipo del parámetro debe corresponder al dato que se solicitará (por ejemplo, texto,
            número, fecha, booleano, imagen o QR).
          </p>

          <div class="text-subtitle-2 font-weight-bold mb-2">4) Cargar y usar imágenes</div>
          <ol class="mb-4 pl-6 text-body-2">
            <li>
              Abre la pestaña <strong>Recursos</strong> del panel izquierdo y pulsa
              <strong>Subir imagen</strong>.
            </li>
            <li>
              Selecciona un archivo PNG o JPEG de hasta 2 MB; todos los recursos de la plantilla
              pueden ocupar hasta 6 MB en conjunto.
            </li>
            <li>
              Añade un elemento <strong>Imagen</strong>. Para una imagen fija, usa
              <strong>Elegir recurso</strong> en sus propiedades o
              <strong>Usar imagen</strong> desde Recursos.
            </li>
            <li>
              Para una imagen variable por documento, deja el origen en modo
              <strong>Dinámica</strong> y vincula la clave que recibirá la URL o el dato de imagen
              durante la generación.
            </li>
          </ol>
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            No se puede borrar un recurso mientras esté asignado a un elemento imagen. Primero
            cambia o elimina ese elemento; luego podrás quitar el recurso de Recursos.
          </v-alert>

          <div class="text-subtitle-2 font-weight-bold mb-2">5) Guardar y pasar a generar</div>
          <p class="text-body-2 mb-0">
            La etiqueta <strong>Cambios sin guardar</strong> indica que debes pulsar
            <strong>Guardar</strong> para persistir tus modificaciones. La opción
            <strong>Configurar y Generar</strong> guarda los cambios pendientes y abre la vista de
            presentación para generar documentos. Si vuelves al listado con cambios pendientes, el
            editor también intenta guardarlos antes de salir.
          </p>
        </v-card-text>
      </v-card>

      <v-card id="tokens-api" class="mb-6" elevation="1">
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-key-link" color="primary" />
          </template>
          <v-card-title>Tokens de API: propósito y uso</v-card-title>
        </v-card-item>

        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Un token de API permite que una aplicación o integración externa se autentique con
            DOCUGEN para consultar plantillas propias y generar documentos sin iniciar sesión
            interactivamente.
          </p>

          <div class="text-subtitle-2 font-weight-bold mb-2">Cómo obtener y usar un token</div>
          <ol class="mb-4 pl-6 text-body-2">
            <li>Abre <strong>Dashboard → Configuración API → Tokens de API</strong>.</li>
            <li>Crea un token, asígnale un nombre descriptivo y selecciona su vencimiento.</li>
            <li>
              Copia el token cuando se muestre: solo se puede ver en ese momento. Guárdalo en un
              gestor de secretos o en una variable de entorno; no lo incluyas en código público ni
              lo compartas.
            </li>
            <li>
              En cada petición HTTP, envíalo en el encabezado
              <code>Authorization: Bearer &lt;token&gt;</code>.
            </li>
          </ol>

          <div class="text-subtitle-2 font-weight-bold mb-2">
            Consideraciones de seguridad y acceso
          </div>
          <ul class="mb-4 pl-6 text-body-2">
            <li>
              El token actúa con el acceso de la cuenta que lo creó; las plantillas consultadas y
              utilizadas deben pertenecer a esa cuenta.
            </li>
            <li>
              Los tokens pueden vencer a los 30 días, 90 días o 1 año. Si ya no se necesitan o
              sospechas que se expusieron, elimínalos desde la tabla para revocarlos.
            </li>
            <li>
              La generación también requiere que el servicio de generación esté habilitado en la
              cuenta.
            </li>
            <li>
              Los contadores y la fecha de último uso de la tabla ayudan a supervisar su actividad;
              no revelan nuevamente el secreto.
            </li>
          </ul>

          <v-alert type="warning" variant="tonal" density="compact">
            No uses el token en código que se ejecute en el navegador de usuarios finales. Las
            llamadas desde una aplicación cliente exponen el secreto; mantenlo en un servidor o
            entorno controlado.
          </v-alert>
        </v-card-text>
      </v-card>

      <v-card id="api-base-url" class="mb-6" elevation="1">
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-web" color="primary" />
          </template>
          <v-card-title>API Base URL</v-card-title>
        </v-card-item>

        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-3">
            <code>API_BASE_URL</code> es la URL base pública del backend que se antepone a las rutas
            de la API. Puedes consultarla y copiarla desde
            <strong>Dashboard → Configuración API → API Base URL</strong>.
          </p>
          <p class="text-body-2 text-medium-emphasis mb-3">
            En DOCUGEN normalmente termina en <code>/api/v1</code>. Por ejemplo, al combinar
            <code>https://tu-dominio/api/v1</code> con <code>/app/documents/generate</code>, la
            solicitud se envía a <code>https://tu-dominio/api/v1/app/documents/generate</code>.
          </p>
          <v-alert type="info" variant="tonal" density="compact">
            Usa la URL que muestra tu configuración; el dominio del ejemplo es ilustrativo. No
            incluyas una ruta de endpoint en la variable base, porque cada llamada agrega su propia
            ruta.
          </v-alert>
        </v-card-text>
      </v-card>

      <v-card id="generacion-mediante-api" class="mb-6" elevation="1">
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-api" color="primary" />
          </template>
          <v-card-title>Generación mediante API</v-card-title>
        </v-card-item>

        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Los ejemplos usan un ID y claves dinámicas ilustrativos. Sustitúyelos por los valores de
            tu plantilla y consulta los parámetros reales con
            <code>GET /app/templates/:template_id/parameters</code>.
          </p>

          <v-alert type="info" variant="tonal" density="compact" class="mb-3">
            Los ejemplos marcados <strong>Linux/macOS (Bash)</strong> usan sintaxis de shell Bash.
            También se incluyen equivalentes para <strong>Windows PowerShell</strong>. Todos usan la
            base pública del backend en <code>API_BASE_URL</code> y el header
            <code>Authorization: Bearer &lt;token&gt;</code>.
          </v-alert>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Ejecuta los comandos desde una terminal: usa los bloques <code>curl</code> en Bash
            (Linux/macOS) y los bloques <code>Invoke-RestMethod</code> en PowerShell (Windows).
            Primero define <code>API_BASE_URL</code> y <code>TOKEN</code> en esa misma sesión y
            reemplaza los valores ilustrativos por los tuyos.
          </p>

          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            En <code>metadata</code>, <code>documentName</code> se guarda como título del PDF y
            <code>status</code> como asunto; ninguno se imprime en la página ni cambia el nombre del
            archivo. El nombre del archivo deriva de la plantilla.
          </v-alert>

          <div class="text-subtitle-2 font-weight-bold mb-2">Ejemplo de variables</div>
          <div class="text-caption font-weight-medium mb-1">Linux/macOS (Bash)</div>
          <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-3">
API_BASE_URL="https://tu-dominio/api/v1"
TOKEN="api_sk_TOKEN_COMPLETO"</pre
          >
          <div class="text-caption font-weight-medium mb-1">Windows PowerShell</div>
          <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-4">
$API_BASE_URL = "https://tu-dominio/api/v1"
$TOKEN = "api_sk_TOKEN_COMPLETO"</pre
          >

          <div class="text-subtitle-2 font-weight-bold mb-2">Payload base</div>
          <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-4">
{
  "templateId": "ID_DE_TU_PLANTILLA",
  "data": {
    "customer_name": "Ana Pérez",
    "document_code": "DOC-2026-001"
  },
  "metadata": {
    "documentName": "Constancia de Ana Pérez",
    "status": "Emitida"
  }
}</pre
          >

          <div class="text-subtitle-2 font-weight-bold mb-3">Requisitos generales</div>
          <ul class="mb-4 pl-6 text-body-2">
            <li>Usa el valor real de <code>API_BASE_URL</code> del backend público.</li>
            <li>
              Incluye el header <code>Authorization: Bearer &lt;token&gt;</code> con un token
              válido.
            </li>
            <li>Usa una plantilla que pertenezca a tu cuenta o al proyecto autorizado.</li>
            <li>
              Para generar documentos, prepara los datos del payload con los nombres de campos
              reales de la plantilla.
            </li>
          </ul>

          <div class="text-subtitle-2 font-weight-bold mb-2">
            Consumir la API desde un sistema externo (Node.js)
          </div>
          <p class="text-body-2 mb-3">
            Esta modalidad sí utiliza los servicios API de DOCUGEN: el código de tu sistema externo
            envía una petición HTTP al backend. DOCUGEN busca la plantilla de tu cuenta, valida los
            datos, genera el PDF y responde con información que incluye una URL para descargarlo. No
            necesitas instalar DOCUGEN-LIB en el sistema cliente.
          </p>
          <div class="text-subtitle-2 font-weight-medium mb-2">Requisitos y configuración</div>
          <ol class="mb-3 pl-6 text-body-2">
            <li>
              Una cuenta desarrollador, una plantilla de esa cuenta y el servicio de generación
              habilitado.
            </li>
            <li>
              Crea un token en <strong>Dashboard → Configuración API → Tokens</strong>. Usa un token
              válido y vigente; para integraciones el alcance <code>documents:generate</code> es el
              recomendado.
            </li>
            <li>
              Configura en el servidor externo la <code>API_BASE_URL</code> mostrada en
              <strong>Configuración API → API Base URL</strong> y el token como variable de entorno
              secreta. La URL base suele terminar en <code>/api/v1</code>; no agregues ahí la ruta
              del endpoint.
            </li>
            <li>
              Consulta <code>GET /app/templates/:template_id/parameters</code> para conocer el ID,
              las claves exactas, tipos y campos requeridos de la plantilla.
            </li>
          </ol>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
            Mantén el token exclusivamente en el servidor del sistema externo. No lo incluyas en
            JavaScript de navegador, aplicaciones móviles distribuidas ni código público. Si se
            expone, revócalo y crea otro.
          </v-alert>

          <div class="text-subtitle-2 font-weight-medium mb-2">
            Ejemplo Node.js: generar y descargar un PDF
          </div>
          <p class="text-body-2 mb-2">
            Requiere Node.js 18 o superior (por <code>fetch</code> global) y módulos ES. Define
            <code>DOCUGEN_API_BASE_URL</code>, <code>DOCUGEN_API_TOKEN</code> y
            <code>DOCUGEN_TEMPLATE_ID</code> en el entorno del servidor. La respuesta de generación
            es JSON con una URL del PDF; el ejemplo descarga el archivo desde esa URL.
          </p>
          <pre v-pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-3">
import { writeFile } from 'node:fs/promises';

const apiBaseUrl = process.env.DOCUGEN_API_BASE_URL?.replace(/\/+$/, '');
const apiToken = process.env.DOCUGEN_API_TOKEN;
const templateId = process.env.DOCUGEN_TEMPLATE_ID;

if (!apiBaseUrl || !apiToken || !templateId) {
  throw new Error('Configura DOCUGEN_API_BASE_URL, DOCUGEN_API_TOKEN y DOCUGEN_TEMPLATE_ID');
}

const response = await fetch(`${apiBaseUrl}/app/documents/generate`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    templateId,
    data: {
      customer_name: 'Ana Pérez',
      document_code: 'DOC-2026-001',
    },
    metadata: {
      documentName: 'Constancia DOC-2026-001',
      status: 'Emitida',
    },
  }),
});

const result = await response.json();
if (!response.ok || !result.success) {
  throw new Error(result.message || `DOCUGEN respondió HTTP ${response.status}`);
}

const pdfResponse = await fetch(result.data.url);
if (!pdfResponse.ok) {
  throw new Error(`No se pudo descargar el PDF: HTTP ${pdfResponse.status}`);
}

await writeFile('./documento.pdf', Buffer.from(await pdfResponse.arrayBuffer()));</pre
          >
          <p class="text-body-2 mb-3">
            En producción, maneja los errores HTTP (por ejemplo, token no válido, parámetros
            faltantes o generación deshabilitada) y decide si guardar el archivo, entregarlo al
            usuario o continuar el proceso de negocio.
          </p>

          <div class="text-subtitle-2 font-weight-medium mb-2">
            Generación masiva desde el sistema externo
          </div>
          <p class="text-body-2 mb-2">
            Para generar hasta 100 documentos con la misma plantilla, envía un arreglo
            <code>documents</code> a <code>POST /app/documents/bulk-generate</code>. Cada registro
            debe incluir sus <code>data</code>; la respuesta contiene el resultado individual y
            puede combinar éxitos y fallos parciales. Descarga la URL de cada resultado exitoso.
          </p>
          <pre v-pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-4">
const batchResponse = await fetch(`${apiBaseUrl}/app/documents/bulk-generate`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    templateId,
    metadata: { documentName: 'Constancia' },
    documents: [
      { id: 'registro-001', data: { customer_name: 'Ana Pérez', document_code: 'DOC-001' } },
      { id: 'registro-002', data: { customer_name: 'Luis Rojas', document_code: 'DOC-002' } },
    ],
  }),
});

const batch = await batchResponse.json();
if (!batchResponse.ok) {
  throw new Error(batch.message || `DOCUGEN respondió HTTP ${batchResponse.status}`);
}

for (const item of batch.data.results) {
  if (item.success) {
    const pdfResponse = await fetch(item.url);
    if (!pdfResponse.ok) {
      throw new Error(`No se pudo descargar el documento ${item.id}`);
    }
    await writeFile(
      `./documento-${item.index + 1}.pdf`,
      Buffer.from(await pdfResponse.arrayBuffer())
    );
  } else {
    console.error('Falló el documento', item.id, item.error);
  }
}</pre
          >

          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            <strong>API vs. DOCUGEN-LIB:</strong> usa la API cuando quieras que DOCUGEN genere el
            documento desde una plantilla administrada en la cuenta y te entregue una URL. Usa
            DOCUGEN-LIB cuando tu aplicación Node.js tenga la plantilla y genere el PDF localmente
            como un <code>Buffer</code>, sin llamar al backend DOCUGEN. Son dos formas distintas de
            integración.
          </v-alert>

          <v-expansion-panels variant="accordion" class="mb-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex flex-wrap align-center ga-2">
                  <v-chip size="x-small" color="info" label>GET</v-chip>
                  <code>/app/documents/availability</code>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 mb-2">
                  <strong>¿Para qué sirve?</strong> Verifica si el servicio de generación está
                  disponible y si el backend puede atender peticiones de render.
                </p>
                <p class="text-body-2 mb-2">
                  <strong>Requisitos:</strong> token válido, URL base correcta, servicio activo.
                </p>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
curl --request GET \
  --header "Authorization: Bearer $TOKEN" \
  --url "$API_BASE_URL/app/documents/availability"</pre
                >
                <div class="text-caption font-weight-medium mb-1">Windows PowerShell</div>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
Invoke-RestMethod -Method Get `
  -Uri "$API_BASE_URL/app/documents/availability" `
  -Headers @{ Authorization = "Bearer $TOKEN" }</pre
                >
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex flex-wrap align-center ga-2">
                  <v-chip size="x-small" color="info" label>GET</v-chip>
                  <code>/app/templates</code>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 mb-2">
                  <strong>¿Para qué sirve?</strong> Lista las plantillas disponibles para tu cuenta
                  y permite filtrar por página, límite o búsqueda.
                </p>
                <p class="text-body-2 mb-2">
                  <strong>Requisitos:</strong> token válido y usuario autorizado para ver plantillas
                  propias.
                </p>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
curl --request GET \
  --header "Authorization: Bearer $TOKEN" \
  --url "$API_BASE_URL/app/templates?page=1&limit=10&search=Factura"</pre
                >
                <div class="text-caption font-weight-medium mb-1">Windows PowerShell</div>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
Invoke-RestMethod -Method Get `
  -Uri "$API_BASE_URL/app/templates?page=1&limit=10&search=Factura" `
  -Headers @{ Authorization = "Bearer $TOKEN" }</pre
                >
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex flex-wrap align-center ga-2">
                  <v-chip size="x-small" color="info" label>GET</v-chip>
                  <code>/app/templates/:template_id</code>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 mb-2">
                  <strong>¿Para qué sirve?</strong> Recupera el detalle de una plantilla y
                  opcionalmente su contenido para inspeccionar elementos y metadatos.
                </p>
                <p class="text-body-2 mb-2">
                  <strong>Requisitos:</strong> ID válido de plantilla y permisos de lectura sobre
                  esa plantilla.
                </p>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
curl --request GET \
  --header "Authorization: Bearer $TOKEN" \
  --url "$API_BASE_URL/app/templates/6aef3cab034d823e825a82ad?include=content"</pre
                >
                <div class="text-caption font-weight-medium mb-1">Windows PowerShell</div>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
Invoke-RestMethod -Method Get `
  -Uri "$API_BASE_URL/app/templates/6aef3cab034d823e825a82ad?include=content" `
  -Headers @{ Authorization = "Bearer $TOKEN" }</pre
                >
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex flex-wrap align-center ga-2">
                  <v-chip size="x-small" color="info" label>GET</v-chip>
                  <code>/app/templates/:template_id/parameters</code>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 mb-2">
                  <strong>¿Para qué sirve?</strong> Devuelve los campos dinámicos de la plantilla,
                  sus tipos, labels y si son requeridos. Es la guía principal para construir el
                  payload <code>data</code>.
                </p>
                <p class="text-body-2 mb-2">
                  <strong>Requisitos:</strong> plantilla existente; debe conocerse exactamente el
                  <code>template_id</code>.
                </p>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
curl --request GET \
  --header "Authorization: Bearer $TOKEN" \
  --url "$API_BASE_URL/app/templates/6aef3cab034d823e825a82ad/parameters"</pre
                >
                <div class="text-caption font-weight-medium mb-1">Windows PowerShell</div>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
Invoke-RestMethod -Method Get `
  -Uri "$API_BASE_URL/app/templates/6aef3cab034d823e825a82ad/parameters" `
  -Headers @{ Authorization = "Bearer $TOKEN" }</pre
                >
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex flex-wrap align-center ga-2">
                  <v-chip size="x-small" color="success" label>POST</v-chip>
                  <code>/app/documents/generate</code>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 mb-2">
                  <strong>¿Para qué sirve?</strong> Genera un documento individual desde una
                  plantilla propia. Es el caso de uso más común para producción documental remota.
                </p>
                <p class="text-body-2 mb-2">
                  <strong>Requisitos:</strong> token válido, <code>templateId</code> existente,
                  payload <code>data</code> con los campos requeridos y
                  <code>metadata</code> opcional.
                </p>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
curl --request POST \
  --header "Authorization: Bearer $TOKEN" \
  --header "Content-Type: application/json" \
  --url "$API_BASE_URL/app/documents/generate" \
  --data-binary @- &lt;&lt;'JSON'
{
  "templateId": "6aef3cab034d823e825a82ad",
  "data": {
    "customer_name": "Ana Pérez",
    "document_code": "DOC-2026-001"
  },
  "metadata": {
    "documentName": "Constancia de Ana Pérez",
    "status": "Emitida"
  }
}
JSON</pre
                >
                <div class="text-caption font-weight-medium mb-1">Windows PowerShell</div>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
$body = @{
  templateId = "6aef3cab034d823e825a82ad"
  data = @{
    customer_name = "Ana Pérez"
    document_code = "DOC-2026-001"
  }
  metadata = @{
    documentName = "Constancia de Ana Pérez"
    status = "Emitida"
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Method Post `
  -Uri "$API_BASE_URL/app/documents/generate" `
  -Headers @{ Authorization = "Bearer $TOKEN" } `
  -ContentType "application/json" `
  -Body $body</pre
                >
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex flex-wrap align-center ga-2">
                  <v-chip size="x-small" color="success" label>POST</v-chip>
                  <code>/app/documents/bulk-generate</code>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="text-body-2 mb-2">
                  <strong>¿Para qué sirve?</strong> Genera múltiples documentos en un solo lote.
                  Útil cuando necesitas emitir varios PDF con la misma plantilla y diferentes datos.
                </p>
                <p class="text-body-2 mb-2">
                  <strong>Requisitos:</strong> token válido, máximo 100 documentos por lote, cada
                  ítem debe tener un <code>id</code> y su payload <code>data</code> completo.
                </p>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
curl --request POST \
  --header "Authorization: Bearer $TOKEN" \
  --header "Content-Type: application/json" \
  --url "$API_BASE_URL/app/documents/bulk-generate" \
  --data-binary @- &lt;&lt;'JSON'
{
  "templateId": "6aef3cab034d823e825a82ad",
  "metadata": {
    "documentName": "Constancia",
    "status": "Emitida"
  },
  "documents": [
    {
      "id": "registro-001",
      "data": {
        "customer_name": "Ana Pérez",
        "document_code": "DOC-001"
      }
    },
    {
      "id": "registro-002",
      "data": {
        "customer_name": "Luis Rojas",
        "document_code": "DOC-002"
      }
    }
  ]
}
JSON</pre
                >
                <div class="text-caption font-weight-medium mb-1">Windows PowerShell</div>
                <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-2">
$body = @{
  templateId = "6aef3cab034d823e825a82ad"
  metadata = @{
    documentName = "Constancia"
    status = "Emitida"
  }
  documents = @(
    @{
      id = "registro-001"
      data = @{
        customer_name = "Ana Pérez"
        document_code = "DOC-001"
      }
    },
    @{
      id = "registro-002"
      data = @{
        customer_name = "Luis Rojas"
        document_code = "DOC-002"
      }
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Method Post `
  -Uri "$API_BASE_URL/app/documents/bulk-generate" `
  -Headers @{ Authorization = "Bearer $TOKEN" } `
  -ContentType "application/json" `
  -Body $body</pre
                >
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>

      <v-card id="generacion-dentro-de-la-aplicacion" class="mb-6" elevation="1">
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-file-document-edit-outline" color="primary" />
          </template>
          <v-card-title>Generación dentro de la aplicación</v-card-title>
        </v-card-item>

        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Esta opción está pensada para generar documentos desde la propia interfaz de DOCUGEN,
            sin necesidad de consumir la API. El flujo principal se realiza desde la vista de
            presentación de una plantilla específica:
          </p>

          <pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-4">
/templates/6aef3cab034d823e825a82ad/present</pre
          >

          <div class="text-subtitle-2 font-weight-bold mb-2">1) Generación individual</div>
          <ol class="mb-4 pl-6 text-body-2">
            <li>
              Ingresa al <strong>Gestor de plantillas</strong> y selecciona una plantilla. Para
              abrirla, usa la opción <strong>Ver</strong> del editor de plantilla.
            </li>
            <li>
              Dentro del editor, selecciona la opción <strong>Configurar y generar</strong> para
              entrar a la vista de presentación.
            </li>
            <li>
              En la parte superior verás dos pestañas:
              <strong>Generador de documento individual</strong> y
              <strong>Generación masiva de documentos</strong>.
            </li>
            <li>
              En la sección de <strong>Configuración</strong>, rellena los campos dinámicos del
              formulario o alterna a la vista JSON si prefieres editar el payload directamente.
            </li>
            <li>Haz clic en <strong>Generar PDF</strong> para crear el documento.</li>
            <li>
              La vista previa se mostrará a la derecha en el panel PDF; si necesitas volver a
              regenerarlo, usa <strong>Regenerar PDF</strong> y luego <strong>Descargar</strong>.
            </li>
          </ol>

          <div class="text-subtitle-2 font-weight-bold mb-2">2) Generación masiva</div>
          <ol class="mb-4 pl-6 text-body-2">
            <li>Cambia a la pestaña <strong>Generación masiva de documentos</strong>.</li>
            <li>
              Agrega filas con los valores de cada documento. La app permite crear varios registros
              en una sola operación.
            </li>
            <li>
              Completa cada conjunto de variables requeridas; si una fila no tiene datos
              suficientes, la generación no quedará habilitada.
            </li>
            <li>Haz clic en <strong>Generar PDFs</strong> para procesar el lote.</li>
            <li>
              Cuando termine, podrás revisarlos y descargarlos desde el botón
              <strong>Descargar PDFs</strong>.
            </li>
          </ol>

          <div class="text-subtitle-2 font-weight-bold mb-2">
            3) Herramientas útiles dentro de la vista
          </div>
          <ul class="mb-4 pl-6 text-body-2">
            <li>
              <strong>Formulario / JSON:</strong> cambia entre el modo visual y el modo de edición
              directa del payload.
            </li>
            <li><strong>Limpiar:</strong> reinicia la configuración actual del documento.</li>
            <li>
              <strong>Vista previa PDF:</strong> te permite validar el resultado antes de
              descargarlo.
            </li>
            <li>
              <strong>Descarga:</strong> disponible después de generar un PDF individual o un lote.
            </li>
          </ul>

          <v-alert type="info" variant="tonal" density="compact">
            Para preparar bien la generación, revisa primero los parámetros dinámicos con
            <code>GET /app/templates/:template_id/parameters</code> y usa los nombres de campo que
            la plantilla exige. En generación masiva, el límite por lote es de 100 documentos.
          </v-alert>
        </v-card-text>
      </v-card>

      <v-card id="generacion-mediante-libreria" elevation="1">
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-library" color="primary" />
          </template>
          <v-card-title>Generación mediante librería</v-card-title>
        </v-card-item>

        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            <strong>DOCUGEN-LIB</strong> es una librería JavaScript para generar documentos PDF
            desde plantillas JSON y datos dinámicos. Se ejecuta dentro de tu aplicación Node.js; no
            es un servicio HTTP ni requiere conectarse al backend de DOCUGEN o a una base de datos.
            Recibe la plantilla y los datos desde tu sistema y devuelve el PDF como un
            <code>Buffer</code>, que luego puedes guardar, enviar en una respuesta o procesar.
          </p>

          <div class="text-subtitle-2 font-weight-bold mb-2">Requisitos y entornos</div>
          <ul class="mb-4 pl-6 text-body-2">
            <li>
              Requiere Node.js <strong>16 o superior</strong> y utiliza módulos ES. Se recomienda
              Node.js 18 o superior, especialmente si se cargarán imágenes desde URL, porque la
              librería usa <code>fetch</code> y <code>AbortController</code> del entorno.
            </li>
            <li>
              Se puede integrar en servicios y aplicaciones de servidor Node.js, por ejemplo
              Express, Fastify o funciones serverless. No está diseñada para ejecutarse directamente
              en el navegador.
            </li>
            <li>
              No requiere framework, base de datos ni servicio DOCUGEN activo. Tu aplicación debe
              proporcionar las plantillas y los datos, y decidir cómo conservar o entregar cada PDF.
            </li>
          </ul>

          <div class="text-subtitle-2 font-weight-bold mb-2">Instalación</div>
          <p class="text-body-2 mb-2">
            Si el paquete está publicado y disponible para tu proyecto, instálalo con npm:
          </p>
          <pre v-pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-3">
npm install docugen-lib</pre
          >
          <p class="text-body-2 mb-2">
            Si vas a utilizar el código fuente del repositorio, clónalo e instálalo; también puedes
            agregarlo como dependencia local desde tu proyecto:
          </p>
          <pre v-pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-3">
git clone --branch exp1 --single-branch https://github.com/jluis-cza/DOCUGEN_LIB.git
cd DOCUGEN_LIB
npm install

# Desde el proyecto que la integrará, ajusta la ruta a la ubicación local:
npm install ../DOCUGEN_LIB</pre
          >
          <p class="text-body-2 mb-4">
            El paquete usa ESM. Configura <code>"type": "module"</code> en el
            <code>package.json</code> de tu aplicación y utiliza <code>import</code>. La versión
            indicada por el repositorio es <strong>1.0.0-alpha.1</strong>; al ser una versión alfa,
            fija la versión usada y prueba su comportamiento antes de desplegarla en producción.
          </p>

          <div class="text-subtitle-2 font-weight-bold mb-2">Flujo de uso básico</div>
          <ol class="mb-4 pl-6 text-body-2">
            <li>
              Crea o carga una plantilla JSON con dimensiones en píxeles, configuración de página y
              elementos.
            </li>
            <li>
              Crea una instancia de <code>DocugenEngine</code> y registra la plantilla con un ID
              local.
            </li>
            <li>
              Consulta los parámetros que requiere la plantilla y valida los datos que recibiste de
              tu aplicación.
            </li>
            <li>
              Llama a <code>generatePDF</code>. Si la generación termina correctamente, guarda o
              transmite el <code>Buffer</code> devuelto.
            </li>
          </ol>
          <pre v-pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-4">
import fs from 'node:fs/promises';
import { DocugenEngine } from 'docugen-lib';

const template = JSON.parse(
  await fs.readFile('./plantilla.json', 'utf8')
);

const engine = new DocugenEngine();
engine.registerTemplate(template, 'documento-base');

const parameters = engine.getTemplateParameters('documento-base');
console.log(parameters);

const data = { nombre: 'Ana Pérez', codigo: 'DOC-001' };
const validation = engine.validateData('documento-base', data);
if (!validation.valid) {
  throw new Error(validation.errors.join('; '));
}

const pdf = await engine.generatePDF({
  template: 'documento-base',
  data,
  metadata: {
    documentName: 'Documento DOC-001',
    author: 'Mi aplicación',
    status: 'Emitido',
  },
});

await fs.writeFile('./documento.pdf', pdf);</pre
          >

          <div class="text-subtitle-2 font-weight-bold mb-2">
            Exponer una ruta propia con DOCUGEN-LIB (opcional)
          </div>
          <p class="text-body-2 mb-2">
            DOCUGEN-LIB es una librería, no un servidor web: no crea rutas HTTP ni llama a la API de
            DOCUGEN. Si tu aplicación Node.js integra la librería y quieres que otros clientes
            llamen a <em>tu propio servicio</em>, puedes crear una ruta Express que invoque el motor
            y devuelva el PDF. Debes implementar en esa ruta autenticación, autorización, límites y
            validación de la plantilla. Si lo que necesitas es consumir los servicios del backend
            DOCUGEN desde otro sistema, usa el ejemplo de cliente API de la sección
            <strong>Generación mediante API</strong>, no este patrón:
          </p>
          <pre v-pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-4">
app.post('/documents/:templateId', async (req, res, next) => {
  try {
    const pdf = await engine.generatePDF({
      template: templatesById[req.params.templateId],
      data: req.body,
    });

    res.type('application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});</pre
          >

          <div class="text-subtitle-2 font-weight-bold mb-2">Funciones disponibles</div>
          <ul class="mb-4 pl-6 text-body-2">
            <li>
              <strong>Plantillas:</strong> registrar, consultar, listar, exportar y quitar
              plantillas del registro en memoria.
            </li>
            <li>
              <strong>Parámetros y validación:</strong> descubrir claves dinámicas desde la metadata
              y los placeholders, validar campos requeridos, tipos y valores permitidos.
            </li>
            <li>
              <strong>PDF individual y por lote:</strong> generar un PDF o hasta 100 por llamada a
              <code>generatePDFs</code>. En el lote, los errores se reportan por registro y no
              cancelan los demás resultados.
            </li>
            <li>
              <strong>Contenido:</strong> 17 tipos de elementos, incluidos texto, títulos,
              subtítulos, párrafos, listas, imágenes, QR, tablas, firmas, casillas, fechas, líneas,
              separadores, rectángulos, pies, placeholders y números de página; admite fuentes,
              estilos, rotación, opacidad y paginación.
            </li>
            <li>
              <strong>Imágenes:</strong> recursos estáticos de plantilla, Data URI, rutas locales y
              URLs HTTP(S). Los recursos admitidos son PNG/JPEG, con límite de 2 MB por imagen y 6
              MB combinados para recursos estáticos de la plantilla.
            </li>
            <li>
              <strong>Metadatos:</strong> permite solicitar un resultado con información de la
              generación y establecer título, autor y estado en los metadatos del PDF.
            </li>
          </ul>

          <div class="text-subtitle-2 font-weight-bold mb-2">Generación masiva</div>
          <p class="text-body-2 mb-2">
            Usa <code>generatePDFs</code> cuando debas generar documentos para varios registros con
            la misma plantilla. Cada elemento de <code>documents</code> recibe sus propios datos y
            opcionalmente puede sobrescribir los metadatos predeterminados del lote:
          </p>
          <pre v-pre class="font-family-monospace text-caption rounded bg-grey-lighten-4 pa-3 mb-4">
const batch = await engine.generatePDFs({
  template: 'documento-base',
  metadata: { documentName: 'Documento' },
  documents: [
    { id: 'registro-1', data: { nombre: 'Ana Pérez' } },
    {
      id: 'registro-2',
      data: { nombre: 'Luis Díaz' },
      metadata: { documentName: 'Documento especial' },
    },
  ],
});

for (const result of batch.results) {
  if (result.success) {
    await fs.writeFile(`./${result.id}.pdf`, result.buffer);
  } else {
    console.error('Falló el registro', result.index, result.error);
  }
}</pre
          >

          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            La librería no sustituye los controles de seguridad de tu aplicación. Restringe quién
            puede generar documentos y evita permitir que usuarios no confiables controlen rutas
            locales o URLs de imágenes que el servidor vaya a leer. Los datos se pasan como objeto
            plano; por ejemplo, <code v-pre>{{ customer.name }}</code> se interpreta como una clave
            literal, no como una ruta dentro de un objeto anidado.
          </v-alert>

          <p class="text-caption text-medium-emphasis mb-0">
            DOCUGEN-LIB genera PDFs de forma independiente. No consulta las plantillas guardadas en
            DOCUGEN ni aplica por sí sola la autenticación, permisos, seguimiento de uso,
            almacenamiento o URLs públicas del backend. Consulta el
            <a href="https://github.com/jluis-cza/DOCUGEN_LIB" target="_blank" rel="noopener">
              repositorio y ejemplos de DOCUGEN-LIB</a
            >
            para obtener el código y revisar su documentación actualizada.
          </p>
        </v-card-text>
      </v-card>
    </v-container>
  </v-container>
</template>

<script setup></script>

<style scoped></style>
