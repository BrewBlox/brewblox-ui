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
      <transition name="slide">
        <q-stepper
          ref="stepper"
          v-model="currentStep"
          v-if="block !== 'new'"
        >
          <q-step
            default
            name="widgets"
            title="Widget Type"
          >
            <q-field
              label="Choose a widget type to add"
              orientation="vertical"
              dark
              icon="dashboard"
            >
              <q-option-group
                dark
                type="radio"
                v-model="widgetType"
                :options="widgetTypes"
              />
            </q-field>
          </q-step>

          <q-step
            name="blocks"
            title="Pick Block"
          >
            <q-field
              :label="`Pick block to associate with '${widgetName}' widget`"
              icon="widgets"
              orientation="vertical"
            >
              <q-select
                v-model="block"
                placeholder="Choose a block"
                :options="blocksForWidget"
              />
            </q-field>
          </q-step>

          <q-step
            name="blocks-setup"
            title="Setup"
            :disable="!needsSetup"
          >
            Block Setup
          </q-step>

          <q-step
            name="finished"
            title="Finished"
          >
            <p class="q-title">Widget ready!</p>
            <p>Widget setup is done, add the widget to your dashboard.</p>
          </q-step>

          <q-stepper-navigation>
            <q-btn
              v-if="currentStep !== 'widgets'"
              @click="$refs.stepper.previous()"
              flat
              label="Go back"
            />

            <q-btn
              :disabled="!canContinue"
              :color="!canContinue ? 'dark-bright' : 'primary'"
              @click="currentStep === 'finished' ? addToDashboard() : $refs.stepper.next()"
              :label="currentStep === 'finished' ? 'Add to dashboard' : 'Next'"
            />
          </q-stepper-navigation>
        </q-stepper>
        <div v-else>
          <component
            :is="widgetType"
            :onCancel="cancelCreate"
            :onCreate="createBlock"
          />
        </div>
      </transition>
    </div>
  </q-modal-layout>
</template>

<script lang="ts" src="./widget-modal.ts" />

<style>
.q-stepper-step-content {
  overflow: hidden;
}

.layout-padding {
  position: relative;
}

.slide-enter-active, .slide-leave-active {
  position: absolute;
  width: calc(100% - 96px);
  transition: opacity .2s, margin-top .2s;
}

.slide-enter, .slide-leave-to {
  opacity: 0;
  margin-top: -40px;
}
</style>
