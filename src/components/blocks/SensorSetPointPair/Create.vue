<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component({
  props: {
    onCancel: {
      type: Function,
      default: () => {},
    },
    onCreate: {
      type: Function,
      default: () => {},
    },
  },
})
/* eslint-enable */
class SensorSetPointPair extends Vue {
  currentStep: string = 'service';
}

export default SensorSetPointPair;
</script>

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
      Hello with Ad.
    </q-step>
    <q-step
      default
      name="sensor-setpoint"
      title="Link sensor and setpoint"
    >
      Hello with Ad.
    </q-step>
    <q-step
      default
      name="create"
      title="Create block"
    >
      Hello with Ad.
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
        color="primary"
        @click="$refs.stepper.next()"
        label="Next"
      />
    </q-stepper-navigation>
  </q-stepper>
</template>

<style scoped>

</style>
