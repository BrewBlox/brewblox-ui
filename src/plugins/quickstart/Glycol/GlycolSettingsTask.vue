<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { convertedTemp, Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { createOutputActions } from '../helpers';
// import { defineChangedBlocks, defineCreatedBlocks, defineLayouts, defineWidgets } from './changes';
import { GlycolConfig } from './types';

@Component
export default class GlycolSettingsTask extends WizardTaskBase<GlycolConfig> {
  beerSetting = new Unit(20, 'degC');


  done(): void {
    // const createdBlocks = defineCreatedBlocks(
    //   this.config,
    //   this.fridgeSetting,
    //   this.beerSetting,
    //   this.activeSetpoint);
    // const changedBlocks = defineChangedBlocks(this.config);
    // const layouts = defineLayouts(this.config);
    // const widgets = defineWidgets(this.config, layouts);

    this.pushActions(createOutputActions());
    // this.updateConfig({
    //   ...this.config,
    //   layouts,
    //   widgets,
    //   changedBlocks,
    //   createdBlocks,
    // });
    this.next();
  }

  created(): void {
    this.beerSetting = convertedTemp(20, sparkStore.units(this.config.serviceId).Temp);
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial setpoint
          </q-item-label>
          <p>The setup creates a setpoint to control your beer temperature</p>
          <p>You can set the initial value now.</p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section class="col-auto">
          <q-item-label caption>
            Beer setpoint
          </q-item-label>
          <UnitField v-model="beerSetting" title="Beer setting" />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn unelevated label="Done" color="primary" @click="done" />
    </q-card-actions>
  </div>
</template>
