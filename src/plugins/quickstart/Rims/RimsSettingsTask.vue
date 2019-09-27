<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { convertedTemp, Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { RimsConfig, RimsOpts } from './types';

@Component
export default class RimsSettingsTask extends WizardTaskBase<RimsConfig> {
  kettleSetting = new Unit(67, 'degC');

  done(): void {
    const opts: RimsOpts = {
      kettleSetting: this.kettleSetting,
    };
    const createdBlocks = defineCreatedBlocks(this.config, opts);
    const changedBlocks = defineChangedBlocks(this.config);
    const layouts = defineLayouts(this.config);
    const widgets = defineWidgets(this.config, layouts);

    this.pushActions(createOutputActions());
    this.updateConfig({
      ...this.config,
      layouts,
      widgets,
      changedBlocks,
      createdBlocks,
    });
    this.next();
  }

  created(): void {
    this.kettleSetting = convertedTemp(67, sparkStore.units(this.config.serviceId).Temp);
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial kettle temperature setting
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Kettle setpoint
          </q-item-label>
          <UnitField v-model="kettleSetting" title="Kettle setting" />
        </q-item-section>
        <q-item-section />
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
