<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import { featureStore } from '@/store/features';

@Component
export default class QuickStartWizardPicker extends Vue {
  searchModel = '';
  wizardModel: any = null;
  wizardActive = false;

  get wizardOptions(): { id: string; displayName: string }[] {
    return featureStore.quickStartValues
      .filter(qs => !!qs.wizardComponent)
      .sort(objectStringSorter('displayName'));
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
    if (!this.wizardModel) {
      this.$q.notify({
        message: 'Please select a wizard',
        color: 'negative',
        icon: 'error',
      });
      return;
    }
    this.setTitle(`${this.wizardModel.displayName} wizard`);
    this.wizardActive = true;
  }

  mounted(): void {
    this.reset();
    this.wizardModel = this.wizardOptions[0];
  }
}
</script>

<template>
  <div>
    <!-- Display selected wizard -->
    <component
      :is="wizardModel.wizardComponent"
      v-if="wizardActive"
      :feature-id="wizardModel.id"
      @title="setTitle"
      @back="reset"
      @close="close"
    />

    <!-- Select a wizard -->
    <template v-else>
      <q-card-section>
        <q-item dark>
          <q-item-section class="text-weight-light">
            <q-item-label class="text-subtitle1">
              Control blocks
            </q-item-label>
            <p>
              Control blocks small elements that run on the BrewBlox Spark that are combined into a control system.
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
      <q-card-section>
        <q-item dark>
          <q-item-section>
            <q-select
              v-model="wizardModel"
              :options="wizardOptions"
              label="Please select a brewing process"
              option-label="displayName"
              option-value="id"
              dark
              options-dark
            />
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark />

      <q-card-actions class="row justify-between">
        <q-btn unelevated label="Back" @click="back" />
        <q-btn unelevated label="Next" color="primary" @click="next" />
      </q-card-actions>
    </template>
  </div>
</template>
