<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { convertedTemp, Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { FermentConfig, FermentOpts } from './types';

@Component
export default class FermentSettingsTask extends WizardTaskBase<FermentConfig> {
  fridgeSetting = new Unit(20, 'degC');
  beerSetting = new Unit(20, 'degC');
  activeSetpoint: 'beer' | 'fridge' = 'beer';

  get targetOpts(): SelectOption[] {
    return [
      {
        label: 'Beer',
        value: 'beer',
      },
      {
        label: 'Fridge',
        value: 'fridge',
      },
    ];
  }

  done(): void {
    const opts: FermentOpts = {
      fridgeSetting: this.fridgeSetting!,
      beerSetting: this.beerSetting!,
      activeSetpoint: this.activeSetpoint,
    };
    const createdBlocks = defineCreatedBlocks(this.config, opts);
    const changedBlocks = defineChangedBlocks(this.config);
    const layouts = defineLayouts(this.config);
    const widgets = defineWidgets(this.config, opts, layouts);

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
    const defaultTemp = convertedTemp(20, sparkStore.units(this.config.serviceId).Temp);
    this.fridgeSetting = defaultTemp.copy();
    this.beerSetting = defaultTemp.copy();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Initial setpoints
          </q-item-label>
          <p>The setup creates 2 setpoints, one for your beer and one for your fridge.</p>
          <p>
            To change which temperature is actively controlled,
            you will change which setpoint is used as input by the PIDs.
            The quick actions on your dashboard will help you switch and reconfigure the PIDs.<br />
          </p>
          <p>You can set the initial values now.</p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Fridge setpoint
          </q-item-label>
          <UnitField v-model="fridgeSetting" title="Fridge setting" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Beer setpoint
          </q-item-label>
          <UnitField v-model="beerSetting" title="Beer setting" />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-item-label caption>
            Setpoint used for control
          </q-item-label>
          <div class="row">
            <q-btn-toggle
              v-model="activeSetpoint"
              :options="targetOpts"
              dark
              dense
              class="col-auto"
            />
          </div>
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
