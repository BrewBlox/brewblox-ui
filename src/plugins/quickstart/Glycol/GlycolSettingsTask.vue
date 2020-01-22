<script lang="ts">
import { Component } from 'vue-property-decorator';

import { convertedTemp, Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import WizardTaskBase from '../components/WizardTaskBase';
import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { GlycolConfig, GlycolOpts } from './types';

@Component
export default class GlycolSettingsTask extends WizardTaskBase<GlycolConfig> {
  beerSetting = new Unit(20, 'degC');
  glycolSetting = new Unit(4, 'degC');


  done(): void {
    const opts: GlycolOpts = { beerSetting: this.beerSetting, glycolSetting: this.glycolSetting };
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
    const unit = sparkStore.units(this.config.serviceId).Temp;
    this.beerSetting = convertedTemp(20, unit);
    this.glycolSetting = convertedTemp(4, unit);
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial setpoints
          </q-item-label>
          <p v-if="config.glycolControl === 'Control'">
            The setup creates a setpoint for your beer temperature and your glycol temperature.
          </p>
          <p v-else>
            The setup creates a setpoint for your beer temperature.
          </p>
          <p>You can set the initial values now.</p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <UnitField
            v-model="beerSetting"
            title="Beer setting"
            label="Beer setpoint"
          />
        </q-item-section>
        <q-item-section>
          <UnitField
            v-if="config.glycolControl==='Control'"
            v-model="glycolSetting"
            title="Glycol setting"
            label="Glycol setpoint"
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
