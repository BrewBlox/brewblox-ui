<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { featureStore, QuickStartFeature } from '@/store/features';

@Component
export default class QuickStartWizardPicker extends Vue {
  model: QuickStartFeature | null = null;
  wizardActive = false;

  mounted(): void {
    this.reset();
  }

  get wizardOptions(): QuickStartFeature[] {
    return featureStore.quickStarts
      .filter(qs => !!qs.component);
  }

  setTitle(title: string): void {
    this.$emit('title', title);
  }

  reset(): void {
    this.wizardActive = false;
    this.setTitle('Quick start wizard');
  }

  back(): void {
    this.$emit('back');
  }

  close(): void {
    this.$emit('close');
  }

  next(): void {
    if (!this.model) {
      return;
    }
    this.setTitle(`${this.model.title} wizard`);
    this.wizardActive = true;
  }
}
</script>

<template>
  <!-- Display selected wizard -->
  <component
    :is="model.component"
    v-if="wizardActive"
    :feature-id="model.id"
    @title="setTitle"
    @back="reset"
    @close="close"
  />

  <!-- Select a wizard -->
  <ActionCardBody v-else>
    <q-card-section>
      <q-item>
        <q-item-section class="text-weight-light">
          <q-item-label class="text-subtitle1">
            Control blocks
          </q-item-label>
          <p>
            Control blocks small elements that run on the Brewblox Spark that are combined into a control system.
            Examples of control blocks are setpoints, sensors, actuators and PIDs.
          </p>
          <p>
            We have pre-configured sets of control blocks for common brewing setups.
            This wizard creates new blocks and sets up relations between them.
          </p>
          <q-item-label class="text-subtitle1">
            Tuning
          </q-item-label>
          <p>
            This wizard uses settings that we think will work for the average setup.
            You might have a more powerful heater, a smaller kettle or a bigger fridge.
          </p>
          <p>
            Do some test runs, look at the PID graphs and make adjustments to tune them to your hardware.
          </p>
          <q-item-label class="text-subtitle1">
            Dashboard
          </q-item-label>
          <p>
            This wizard will create a new dashboard to show the most relevant values in your setup.
            The dashboard will have a graph, a graphical overview of your system
            and some quick actions to change multiple blocks at once.
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>
    <div class="q-mx-md q-mb-md q-px-sm q-gutter-sm column">
      <div class="text-subtitle1">
        Please select a brewing process
      </div>
      <ListSelect
        v-model="model"
        :options="wizardOptions"
        option-value="id"
        option-label="title"
        @confirm="v => { model = v; next(); }"
      />
    </div>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!model" unelevated label="Next" color="primary" @click="next" />
    </template>
  </ActionCardBody>
</template>
