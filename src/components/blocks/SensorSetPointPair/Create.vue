<template>
  <q-stepper
    ref="stepper"
    v-model="currentStep"
  >
    <q-step
      default
      name="service"
      title="Which controller service?"
    >
      <q-field
        label="Choose controller service to create sensor set point pair on"
        orientation="vertical"
        dark
        icon="settings system daydream"
      >
        <q-option-group
          dark
          type="radio"
          v-model="service"
          @input="clearLinks"
          :options="services"
        />
      </q-field>
    </q-step>
    <q-step
      default
      name="block-id"
      title="Which block ID?"
    >
      <q-field
        label="Choose block ID"
        dark
        :count="100"
      >
        <q-input
          v-model="blockId"
        />
      </q-field>
    </q-step>
    <q-step
      default
      name="sensor-setpoint"
      title="Link sensor and setpoint"
    >
      <q-field
        label="Pick a sensor"
        orientation="vertical"
        dark
        icon="settings input antenna"
      >
        <q-select
          v-model="sensorInput"
          :options="allSensors"
        />
      </q-field>
      <q-field
        label="Pick a set point"
        orientation="vertical"
        dark
        icon="input"
      >
        <q-select
          v-model="setpointInput"
          :options="allSetPoints"
        />
      </q-field>
    </q-step>
    <q-step
      default
      name="create"
      title="Create block"
    >
      <p class="q-title">Done!</p>
      <p>
        Sensor SetPoint Pair is ready to be created.
      </p>
    </q-step>

    <q-stepper-navigation>
      <q-btn
        v-if="currentStep === 'service'"
        flat
        @click="$props.onCancel"
        label="Cancel"
      />
      <q-btn
        v-if="currentStep !== 'service'"
        flat
        @click="$refs.stepper.previous()"
        label="Back"
      />
      <q-btn
        v-if="currentStep !== 'create'"
        :color="!canContinue ? 'dark-bright' : 'primary'"
        :disabled="!canContinue"
        @click="$refs.stepper.next()"
        label="Next"
      />
      <q-btn
        v-if="currentStep === 'create'"
        color="primary"
        label="Create"
        :loading="creating"
        @click="createBlock"
      />
    </q-stepper-navigation>
  </q-stepper>
</template>

<script lang="ts" src="./Create.ts" />
