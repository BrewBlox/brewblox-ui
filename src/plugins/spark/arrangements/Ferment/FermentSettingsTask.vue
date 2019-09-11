<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { createActions, defineChangedBlocks, defineCreatedBlocks, defineLayouts, defineWidgets } from './changes';
import { FermentConfig } from './types';


@Component
export default class FermentSettingsTask extends WizardTaskBase {
  readonly config!: FermentConfig;

  fridgeSetting = new Unit(20, 'degC');
  beerSetting = new Unit(20, 'degC');
  activeSetpoint: 'beer' | 'fridge' = 'beer';

  get userTemp(): string {
    return sparkStore.units(this.config.serviceId).Temp;
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

  defaultTemp(): Unit {
    const degC = 20;
    const defaultTempValues = { degC, degF: (degC * 9 / 5) + 32, degK: degC + 273.15 };
    return new Unit(defaultTempValues[this.userTemp] || 20, this.userTemp);
  }

  done(): void {
    const createdBlocks = defineCreatedBlocks(
      this.config,
      this.fridgeSetting,
      this.beerSetting,
      this.activeSetpoint);
    const changedBlocks = defineChangedBlocks(this.config);
    const layouts = defineLayouts(this.config);
    const widgets = defineWidgets(this.config, layouts);

    this.pushActions(createActions());
    this.updateConfig<FermentConfig>({
      ...this.config,
      layouts,
      widgets,
      changedBlocks,
      createdBlocks,
    });
    this.next();
  }

  mounted(): void {
    this.fridgeSetting = this.defaultTemp();
    this.beerSetting = this.defaultTemp();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1 text-primary">
            Initial setpoints
          </q-item-label>
          <p>The setup creates 2 setpoints, one for your beer and one for your fridge.</p>
          <p>To change which temperature is actively controlled, you will change which setpoint is used as input for your PIDs.</p>
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
            Setpoint used by control
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
