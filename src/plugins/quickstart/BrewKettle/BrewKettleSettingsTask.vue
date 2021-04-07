<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxQty, deltaTempQty, JSQuantity } from '@/helpers/bloxfield';
import { systemStore } from '@/store/system';

import QuickStartTaskBase from '../components/QuickStartTaskBase';
import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { BrewKettleConfig, BrewKettleOpts } from './types';


@Component
export default class BrewKettleSettingsTask extends QuickStartTaskBase<BrewKettleConfig> {
  fullPowerDelta = deltaTempQty(2);

  volumeRules: InputRule[] = [
    v => v !== 0 || 'Volume can\'t be 0',
  ]

  get userTemp(): string {
    return systemStore.units.temperature;
  }

  get kp(): JSQuantity {
    return bloxQty(100 / (this.fullPowerDelta.value || 2), `1/${this.userTemp}`);
  }

  done(): void {
    const opts: BrewKettleOpts = {
      kp: this.kp,
    };

    const createdBlocks = defineCreatedBlocks(this.config, opts);
    const changedBlocks = defineChangedBlocks(this.config);
    const layouts = defineLayouts(this.config);
    const widgets = defineWidgets(this.config, opts, layouts);
    const displayedBlocks = defineDisplayedBlocks(this.config);

    this.pushActions(createOutputActions());
    this.updateConfig({
      ...this.config,
      layouts,
      widgets,
      changedBlocks,
      createdBlocks,
      displayedBlocks,
    });
    this.next();
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section class="text-weight-light">
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Brew kettle heating
          </q-item-label>
          <p>
            If the temperature is more than
            <InlineQuantityField v-model="fullPowerDelta" title="Full power delta" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the Kettle PID will be set to {{ kp }}.
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn unelevated label="Done" color="primary" @click="done" />
    </template>
  </ActionCardBody>
</template>
