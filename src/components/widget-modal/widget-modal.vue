<template>
  <q-modal-layout>
    <q-toolbar
      slot="header"
      color="dark-bright"
    >
      <q-toolbar-title>
        New Widget
      </q-toolbar-title>
      <q-btn
        flat
        v-close-overlay
      >
        Close
      </q-btn>
    </q-toolbar>

    <div class="layout-padding">
      <q-stepper v-model="currentStep">
        <q-step
          default
          name="widgets"
          title="Widget Type"
        >
          <q-field
            label="Choose a widget type to add"
            orientation="vertical"
            dark
          >
            <q-option-group
              dark
              type="radio"
              v-model="widgetType"
              :options="widgetTypes"
            />
          </q-field>

          <q-stepper-navigation>
            <q-btn
              :disabled="!widgetType"
              :color="!widgetType ? 'dark-bright' : 'primary'"
              @click="currentStep = 'blocks'"
              label="Next"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step
          name="blocks"
          title="Pick Block"
        >
          Block

          <q-stepper-navigation>
            <q-btn
              @click="currentStep = 'widgets'"
              flat
              label="Go back"
            />

            <q-btn
              color="primary"
              @click="currentStep = 'blocks-setup'"
              label="Next"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step
          name="blocks-setup"
          title="Setup"
        >
          Block Setup

          <q-stepper-navigation>
            <q-btn
              @click="currentStep = 'blocks'"
              flat
              label="Go back"
            />

            <q-btn
              color="primary"
              @click="currentStep = 'finished'"
              label="Next"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step
          name="finished"
          title="Finished"
        >
          Done!

          <q-stepper-navigation>
            <q-btn
              @click="currentStep = 'blocks-setup'"
              flat
              label="Go back"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </div>
  </q-modal-layout>
</template>

<script lang="ts" src="./widget-modal.ts" />

<style scoped>

</style>
