<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { Service } from '@/store/services/state';
import { Block } from '@/plugins/spark/state';

import { allServices } from '@/store/services/getters';
import { allBlocks } from '@/plugins/spark/store/getters';

@Component({
  props: {
    onCancel: {
      type: Function,
      default: () => { },
    },
    onCreate: {
      type: Function,
      default: () => { },
    },
  },
})
class Metrics extends Vue {
  currentStep: string = 'service';
  creating: boolean = false;
  service: Service | null = null;
  blockInput: Block | null = null;

  get services() {
    return allServices(this.$store).map(service => ({
      label: service.id,
      value: service,
    }));
  }

  get canContinue() {
    if (this.currentStep === 'service' && this.service) {
      return true;
    }

    if (this.currentStep === 'choose-block' && this.blockInput) {
      return true;
    }

    return false;
  }

  get allBlocks() {
    if (!this.service) {
      return [];
    }

    return allBlocks(this.$store, this.service.id)
      .map(block => ({
        label: `${block.serviceId}/${block.id}`,
        value: block,
      }));
  }

  clearBlocks() {
    this.blockInput = null;
  }

  async createBlock() {
    try {
      this.creating = true;

      const block = {};

      this.$props.onCreate(block);
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default Metrics;
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
      <q-field
        label="Choose your device service"
        orientation="vertical"
        dark
        icon="settings system daydream"
      >
        <q-option-group
          dark
          type="radio"
          v-model="service"
          @input="clearBlocks"
          :options="services"
        />
      </q-field>
    </q-step>

    <q-step
      default
      name="choose-block"
      title="Choose block for metrics"
    >
      <q-field
        label="Pick a block"
        orientation="vertical"
        dark
        icon="widgets"
      >
        <q-select
          v-model="blockInput"
          :options="allBlocks"
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
        Metrics block is ready to be created.
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

<style scoped>
</style>
