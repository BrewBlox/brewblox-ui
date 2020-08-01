<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxQty } from '@/helpers/bloxfield';
import { sparkStore } from '@/plugins/spark/store';

import WizardTaskBase from '../components/WizardTaskBase';
import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { FermentConfig, FermentOpts } from './types';

@Component
export default class FermentSettingsTask extends WizardTaskBase<FermentConfig> {
  fridgeSetting = bloxQty(20, 'degC');
  beerSetting = bloxQty(20, 'degC');
  activeSetpoint: 'beer' | 'fridge' = 'beer';

  created(): void {
    const { Temp } = sparkStore.moduleById(this.config.serviceId)!.units;
    this.fridgeSetting = this.fridgeSetting.to(Temp);
    this.beerSetting = this.beerSetting.to(Temp);
  }

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
            Initial setpoints
          </q-item-label>
          <p>The setup creates 2 setpoints, one for your beer and one for your fridge.</p>
          <p>
            To change which temperature is actively controlled,
            you will change which setpoint is used as input by the PIDs.
            The quick actions on your dashboard will help you switch and reconfigure the PIDs.<br>
          </p>
          <p>You can set the initial values now.</p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuantityField v-model="fridgeSetting" label="Fridge setpoint" title="Fridge setting" />
        </q-item-section>
        <q-item-section>
          <QuantityField v-model="beerSetting" label="Beer setpoint" title="Beer setting" />
        </q-item-section>
        <q-item-section class="col-auto">
          <LabeledField label="Active setpoint">
            <q-btn-toggle
              v-model="activeSetpoint"
              :options="targetOpts"
              unelevated
              dense
              class="col-auto"
            />
          </LabeledField>
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
