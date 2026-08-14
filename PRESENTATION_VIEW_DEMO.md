# 📋 RESUMEN VISUAL - Interfaz de Configuración/Presentación

## 🎬 Flujo Completo de Usuario

### Paso 1️⃣: Usuario en Editor de Plantillas

```
┌─────────────────────────────────────────────────────────────────┐
│ TEMPLATE EDITOR - "Plantilla 2"                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ [Elementos]  [Propiedades]                                       │
│                                                                   │
│ • Título                          │  ┌──────────────────────┐   │
│ • Cliente: {{cliente_nombre}}     │  │                      │   │
│ • Empresa: {{empresa}}            │  │      SVG Canvas      │   │
│ • QR: {{cliente_id}}              │  │                      │   │
│ • Firma: _______________          │  └──────────────────────┘   │
│                                   │                              │
│                                   │  🔘 Guardar Cambios         │
│                                   │  🔘 Deshacer                │
│                                   │  🔘 Rehacer                 │
│                                   │  🔘 [Configurar y Generar]  │
│                                   │     ^ NUEVO BOTÓN           │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 2️⃣: Usuario Hace Click en "Configurar y Generar"

```
Usuario click en botón
     ↓
navigateTo('/templates/ID/present')
     ↓
(Transición de pantalla)
```

### Paso 3️⃣: Abre Interfaz de Configuración/Presentación

#### Vista Inicial (Sin PDF)

```
┌────────────────────────────────────────────────────────────────────┐
│ ◀ Plantilla: "Plantilla 2"  [JSON] [Limpiar] [Gen PDF] [Cerrar]   │
├──────────────────────────┬──────────────────────────────────────────┤
│                          │                                          │
│   CONFIGURACIÓN          │        PREVIEW PDF                      │
│   ⚙️ 5 parámetros        │                                          │
│                          │   ┌────────────────────────────────────┐│
│ cliente_nombre           │   │                                    ││
│ [                   ]    │   │   📄 No hay PDF generado           ││
│ (Requerido)             │   │                                    ││
│ Usado en: text          │   │   Completa la configuración y      ││
│                          │   │   haz click en "Generar PDF"       ││
│ empresa                  │   │                                    ││
│ [                   ]    │   │                                    ││
│ (Requerido)             │   │                                    ││
│ Usado en: text          │   └────────────────────────────────────┘│
│                          │                                          │
│ cliente_id               │                                          │
│ [                   ]    │                                          │
│ (Requerido)             │                                          │
│ Usado en: qr            │                                          │
│                          │                                          │
│ fecha                    │                                          │
│ [                   ]    │                                          │
│ (Requerido)             │                                          │
│ Usado en: text          │                                          │
│                          │                                          │
│ codigo                   │                                          │
│ [                   ]    │                                          │
│ (Requerido)             │                                          │
│ Usado en: text          │                                          │
│                          │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

### Paso 4️⃣: Usuario Completa Formulario

```
Usuario edita campo "cliente_nombre" y escribe "Luis"
     ↓
configData.cliente_nombre = "Luis"
     ↓
validationErrors.cliente_nombre = null (se limpia error)
     ↓
Vue actualiza UI en tiempo real
```

#### Vista Completada (Con Validación)

```
┌────────────────────────────────────────────────────────────────────┐
│ ◀ Plantilla: "Plantilla 2"  [JSON] [Limpiar] [✓ Gen PDF] [Cerrar] │
├──────────────────────────┬──────────────────────────────────────────┤
│                          │                                          │
│   CONFIGURACIÓN          │        PREVIEW PDF                      │
│   ⚙️ 5 parámetros        │                                          │
│                          │   ┌────────────────────────────────────┐│
│ ✓ cliente_nombre         │   │                                    ││
│ [Luis            ]       │   │   📄 No hay PDF generado           ││
│                          │   │                                    ││
│ ✓ empresa                │   │   Completa la configuración y      ││
│ [Docugen         ]       │   │   haz click en "Generar PDF"       ││
│                          │   │                                    ││
│ ✓ cliente_id             │   │                                    ││
│ [CL-001          ]       │   │                                    ││
│                          │   └────────────────────────────────────┘│
│ ✓ fecha                  │                                          │
│ [13/8/2026       ]       │                                          │
│                          │                                          │
│ ✓ codigo                 │                                          │
│ [DOC-2026-001    ]       │                                          │
│                          │                                          │
│ ✓ Todos los campos       │                                          │
│   están completos        │                                          │
│                          │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

### Paso 5️⃣: Usuario Hace Click "Generar PDF"

#### Durante Generación (Loading)

```
┌────────────────────────────────────────────────────────────────────┐
│ ◀ Plantilla: "Plantilla 2"  [JSON] [Limpiar] [Gen PDF] [Cerrar]   │
├──────────────────────────┬──────────────────────────────────────────┤
│                          │                                          │
│   CONFIGURACIÓN          │        PREVIEW PDF                      │
│                          │                                          │
│ (Campos deshabilitados)  │   ╔════════════════════════════════════╗│
│                          │   ║                                    ║│
│ cliente_nombre           │   ║  ⏳ GENERANDO DOCUMENTO...         ║│
│ [Luis            ]       │   ║                                    ║│
│ (deshabilitado)          │   ║  (spinner de carga)                ║│
│                          │   ║                                    ║│
│ ... (más campos)         │   ║  Por favor espera                  ║│
│                          │   ║                                    ║│
│                          │   ╚════════════════════════════════════╝│
│                          │                                          │
│                          │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

**Backend en este momento:**

```
1. Recibe POST /v1/api/app/render
   {
     templateId: "6a7adfc8bb826861d56dd671",
     data: {
       cliente_nombre: "Luis",
       empresa: "Docugen",
       cliente_id: "CL-001",
       fecha: "13/8/2026",
       codigo: "DOC-2026-001"
     },
     metadata: {documentName: "Plantilla 2"}
   }

2. Carga template de MongoDB
3. Para cada elemento:
   - Resuelve placeholders
   - Renderiza con PDFKit
4. Guarda PDF en /storage/generated/
5. Retorna URL
```

### Paso 6️⃣: PDF Generado y Listo

#### Vista con PDF Generado

```
┌────────────────────────────────────────────────────────────────────┐
│ ◀ Plantilla: "Plantilla 2"  [JSON] [Limpiar] [Regenerar] [⬇️Desc] │
├──────────────────────────┬──────────────────────────────────────────┤
│                          │                                          │
│   CONFIGURACIÓN          │        PREVIEW PDF                      │
│                          │                                          │
│ cliente_nombre           │   ┌────────────────────────────────────┐│
│ [Luis            ]       │   │  PLANTILLA 2                       ││
│ Usado en: text          │   │                                    ││
│                          │   │  CONTRATO                          ││
│ empresa                  │   │  Entre "Luis" de "Docugen"         ││
│ [Docugen         ]       │   │                                    ││
│ Usado en: text          │   │  Este documento certifica...        ││
│                          │   │                                    ││
│ cliente_id               │   │  ID Cliente: CL-001                ││
│ [CL-001          ]       │   │                                    ││
│ Usado en: qr            │   │  ┌──────────────┐                 ││
│                          │   │  │              │                 ││
│ fecha                    │   │  │   QR CODE    │                 ││
│ [13/8/2026       ]       │   │  │ (CL-001)     │                 ││
│ Usado en: text          │   │  │              │                 ││
│                          │   │  └──────────────┘                 ││
│ codigo                   │   │                                    ││
│ [DOC-2026-001    ]       │   │  Firma Autorizada: ___________     ││
│ Usado en: text          │   │                                    ││
│                          │   │  Generado: 13/8/2026              ││
│ [Actualizar] [+]         │   │                                    ││
│                          │   │  Docugen © 2026                   ││
│                          │   │  Página 1 de 1                    ││
│                          │   └────────────────────────────────────┘│
│                          │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

### Paso 7️⃣: Usuario Descarga PDF

```
Usuario click "Descargar"
     ↓
downloadPdf()
     ↓
Crea link <a>
     ↓
Simula click
     ↓
Archivo "Plantilla-2.pdf" se descarga
```

---

## 🔄 Vista Alternativa: Modo JSON

### Click en Botón "JSON"

```
┌────────────────────────────────────────────────────────────────────┐
│ ◀ Plantilla: "Plantilla 2"  [Formulario] [Limpiar] [Gen PDF] [Desc]│
├──────────────────────────┬──────────────────────────────────────────┤
│                          │                                          │
│   CONFIGURACIÓN          │        PREVIEW PDF                      │
│   ⚙️ Modo JSON            │                                          │
│                          │   ┌────────────────────────────────────┐│
│ Edita el JSON completo:  │   │ (PDF del paso anterior)            ││
│                          │   │                                    ││
│ ┌──────────────────────┐ │   │                                    ││
│ │{                     │ │   │                                    ││
│ │  "cliente_nombre":   │ │   │                                    ││
│ │    "Luis",           │ │   │                                    ││
│ │  "empresa":          │ │   │                                    ││
│ │    "Docugen",        │ │   │                                    ││
│ │  "cliente_id":       │ │   │                                    ││
│ │    "CL-001",         │ │   │                                    ││
│ │  "fecha":            │ │   │                                    ││
│ │    "13/8/2026",      │ │   │                                    ││
│ │  "codigo":           │ │   │                                    ││
│ │    "DOC-2026-001"    │ │   │                                    ││
│ │}                     │ │   │                                    ││
│ └──────────────────────┘ │   └────────────────────────────────────┘│
│                          │                                          │
│ Usuario puede:           │                                          │
│ • Editar directamente    │                                          │
│ • Copy-paste datos       │                                          │
│ • Validación JSON        │                                          │
│                          │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

### Pegar JSON Nuevo

```
Usuario:
1. Limpia contenido
2. Pega nuevo JSON:
   {
     "cliente_nombre": "María",
     "empresa": "TechCorp",
     "cliente_id": "CL-002",
     "fecha": "14/8/2026",
     "codigo": "DOC-2026-002"
   }
3. Click fuera del campo
     ↓
syncJsonToData()
     ↓
JSON.parse() valida JSON
     ↓
setConfigDataBulk() copia a datos
     ↓
Volver a modo Formulario → Ve campos actualizados
     ↓
"Regenerar" PDF con nuevos datos
```

---

## 📊 Casos de Uso Visuales

### Caso 1: Contrato Comercial

```
Template: Contrato Ejemplo
├── cliente_nombre → "Luis González"
├── empresa → "Acme Corp"
├── fecha → "2026-08-14"
├── monto → "USD 5,000"
└── términos → "30 días"

PDF resultante:
┌────────────────────┐
│    CONTRATO        │
│ Entre:             │
│ Luis González      │
│ Y: Acme Corp       │
│                    │
│ Monto: USD 5,000   │
│ Términos: 30 días  │
│ Fecha: 2026-08-14  │
│                    │
│ Firma: _________   │
└────────────────────┘
```

### Caso 2: Factura

```
Template: Factura Estándar
├── cliente_nombre → "Juan Pérez"
├── empresa → "JP Consulting"
├── numero_factura → "INV-2026-001"
├── fecha → "2026-08-14"
├── total → "USD 1,500"
└── condiciones_pago → "Neto 30"

PDF resultante:
┌────────────────────┐
│    FACTURA         │
│ #INV-2026-001      │
│                    │
│ Contratante:       │
│ Juan Pérez         │
│ JP Consulting      │
│                    │
│ Total: USD 1,500   │
│ Pago: Neto 30      │
│ Fecha: 2026-08-14  │
└────────────────────┘
```

### Caso 3: Certificado

```
Template: Certificado de Participación
├── participante → "Carlos López"
├── evento → "Seminario Web"
├── fecha_evento → "2026-08-10"
├── duracion → "4 horas"
└── codigo → "CRT-2026-342"

PDF resultante:
┌────────────────────┐
│  CERTIFICADO DE    │
│   PARTICIPACIÓN    │
│                    │
│ Se certifica que:  │
│ Carlos López       │
│ participó en:      │
│ Seminario Web      │
│                    │
│ Duración: 4 horas  │
│ Fecha: 2026-08-10  │
│ Código: CRT-...342 │
└────────────────────┘
```

---

## 🎛️ Controles Disponibles

| Botón              | Efecto                | Estado              |
| ------------------ | --------------------- | ------------------- |
| **◀ Volver**      | Navega al editor      | Siempre activo      |
| **[JSON]**         | Alterna a modo JSON   | Siempre activo      |
| **[Formulario]**   | Vuelve a formulario   | Desde JSON          |
| **[Limpiar]**      | Resetea todos campos  | Siempre activo      |
| **[Gen PDF]**      | Genera PDF primero    | Activo si campos OK |
| **[Regenerar]**    | Genera PDF nuevamente | Activo si hay PDF   |
| **[⬇️ Descargar]** | Descarga archivo      | Activo si hay PDF   |
| **[Cerrar]**       | Cierra interfaz       | Siempre activo      |

---

## ⚠️ Validación y Errores

### Campo Incompleto

```
┌─────────────────────┐
│ cliente_nombre      │
│ [                 ] │
│ 🔴 Es requerido     │
│ Usado en: text      │
└─────────────────────┘
```

### Resumen de Errores

```
┌──────────────────────────┐
│ ⚠️ Campos incompletos:    │
│                          │
│ • cliente_nombre:        │
│   Es requerido           │
│                          │
│ • codigo:                │
│   Es requerido           │
│                          │
│ Completa los campos      │
│ antes de generar PDF     │
└──────────────────────────┘
```

---

## 🎨 Animaciones

### Al Generar PDF

```
1. Dialog aparece con animación fade-in
2. Spinner gira continuamente
3. Texto "Generando documento..."
4. Dialog desaparece con fade-out
5. PDF aparece en preview
```

### Al Cambiar Campo

```
1. Usuario edita input
2. Error se limpia inmediatamente
3. Icono ✓ aparece con animación
4. Validación actualiza en tiempo real
```

### Al Cambiar Vista

```
1. Click en [JSON]
2. Fade-out del formulario
3. JSON editor aparece
4. JSON pre-formateado y visible
```

---

## 📱 Responsive Design

### Desktop (Actual)

```
[Left 50%] | [Right 50%]
Config    | PDF Preview
```

### Tablet (Futuro Opcional)

```
[Config - Full Width]
[PDF - Full Width]
```

### Mobile (Futuro Opcional)

```
Stack vertical
Tabs: Configuración | Preview
```

---

Este es el flujo completo de la nueva interfaz de Configuración/Presentación.
¡Lista para usar inmediatamente!
