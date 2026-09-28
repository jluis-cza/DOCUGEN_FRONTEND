<template>
  <v-container class="py-12" max-width="800">
    <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mb-8">
      Volver al inicio
    </v-btn>

    <h1 class="text-h4 mb-2">Q&amp;A</h1>
    <p class="text-body-1 text-medium-emphasis mb-8">
      Respuestas a preguntas frecuentes sobre el acceso y las funciones de DOCUGEN.
    </p>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel value="suspension">
        <v-expansion-panel-title>¿Qué significa que mi cuenta esté suspendida?</v-expansion-panel-title>
        <v-expansion-panel-text>
          Una cuenta suspendida no puede iniciar sesión ni utilizar las funciones de DOCUGEN. El
          acceso se restablece cuando un administrador cambia el estado de la cuenta.
          <p class="mt-4">
            La suspensión es una decisión administrativa que puede responder a una revisión de
            seguridad o del uso de la cuenta. DOCUGEN no guarda aquí el motivo individual de cada
            suspensión. Solicita al administrador que te informe el motivo y los pasos para
            recuperar el acceso; incluye tu nombre de usuario para identificar la cuenta.
          </p>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="login">
        <v-expansion-panel-title>¿Qué hago si no puedo iniciar sesión?</v-expansion-panel-title>
        <v-expansion-panel-text>
          Verifica que estés usando el correo o nombre de usuario correcto. Si aparece un aviso de
          suspensión, consulta la respuesta anterior y comunícate con un administrador.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="templates">
        <v-expansion-panel-title>¿Para qué sirven las plantillas?</v-expansion-panel-title>
        <v-expansion-panel-text>
          Las plantillas permiten diseñar documentos reutilizables y completar sus campos con datos
          al generar cada documento.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel id="service-edition" value="service-edition">
        <v-expansion-panel-title>¿Por qué no puedo editar mis plantillas?</v-expansion-panel-title>
        <v-expansion-panel-text>
          La edición requiere que el servicio «Edición de Plantillas» esté habilitado para tu
          cuenta. Mientras esté deshabilitado no podrás abrir el editor ni crear, modificar o
          eliminar plantillas. Consulta al administrador de DOCUGEN para solicitar acceso.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel id="service-generation" value="service-generation">
        <v-expansion-panel-title>¿Por qué no puedo generar documentos?</v-expansion-panel-title>
        <v-expansion-panel-text>
          La generación requiere que el servicio «Generación de Documentos» esté habilitado para tu
          cuenta. Mientras esté deshabilitado no podrás generar documentos desde DOCUGEN ni usar
          los endpoints de generación de la API. Consulta al administrador de DOCUGEN para
          solicitar acceso.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel value="help">
        <v-expansion-panel-title>¿Dónde encuentro ayuda de uso?</v-expansion-panel-title>
        <v-expansion-panel-text>
          Consulta la sección
          <RouterLink to="/manual">Ayuda</RouterLink>
          para ver el manual de DOCUGEN.
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

  </v-container>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>