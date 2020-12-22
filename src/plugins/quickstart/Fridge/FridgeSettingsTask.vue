<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxQty } from '@/helpers/bloxfield';
import { sparkStore } from '@/plugins/spark/store';

import QuickStartTaskBase from '../components/QuickStartTaskBase';
import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { FridgeConfig, FridgeOpts } from './types';

@Component
export default class FridgeSettingsTask extends QuickStartTaskBase<FridgeConfig> {
  fridgeSetting = bloxQty(20, 'degC');

  created(): void {
    const { Temp } = sparkStore.moduleById(this.config.serviceId)!.units;
    this.fridgeSetting = this.fridgeSetting.to(Temp);
  }

  done(): void {
    const opts: FridgeOpts = {
      fridgeSetting: this.fridgeSetting!,
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
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial setpoint value
          </q-item-label>
          <p>
            The setup creates a Setpoint for your fridge.<br>
            You can set the initial values now.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuantityField
            v-model="fridgeSetting"
            label="Fridge setpoint"
            title="Fridge setting"
          />
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
