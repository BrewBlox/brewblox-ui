<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Temp, Unit } from '@/helpers/units';
import { tryDisplayBlock } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';

import WizardTaskBase from '../components/WizardTaskBase';
import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { FermentConfig, FermentOpts } from './types';

@Component
export default class FermentSettingsTask extends WizardTaskBase<FermentConfig> {
  fridgeSetting = new Unit(20, 'degC');
  beerSetting = new Unit(20, 'degC');
  activeSetpoint: 'beer' | 'fridge' = 'beer';

  created(): void {
    const defaultTemp = new Temp(20, 'degC')
      .convert(sparkStore.units(this.config.serviceId).Temp);
    this.fridgeSetting = defaultTemp.copy();
    this.beerSetting = defaultTemp.copy();
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

    this.pushActions([
      ...createOutputActions(),
      async (config: FermentConfig) => {
        const coolPid = sparkStore.blockById(config.serviceId, config.names.coolPid);
        const heatPid = sparkStore.blockById(config.serviceId, config.names.heatPid);
        tryDisplayBlock(coolPid, {
          showDialog: false,
          color: '4e78f5',
          name: coolPid.id.substring(config.prefix.length).trim(),
        });
        tryDisplayBlock(heatPid, {
          showDialog: false,
          color: 'ad1c47',
          name: heatPid.id.substring(config.prefix.length).trim(),
        });
      },
    ]);
    this.updateConfig({
      ...this.config,
      layouts,
      widgets,
      changedBlocks,
      createdBlocks,
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
          <UnitField v-model="fridgeSetting" label="Fridge setpoint" title="Fridge setting" />
        </q-item-section>
        <q-item-section>
          <UnitField v-model="beerSetting" label="Beer setpoint" title="Beer setting" />
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
