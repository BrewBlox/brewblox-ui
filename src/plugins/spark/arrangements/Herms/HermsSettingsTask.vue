<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { createActions, defineChangedBlocks, defineCreatedBlocks, defineLayouts, defineWidgets } from './changes';
import { HermsConfig } from './types';


@Component
export default class HermsSettingsTask extends WizardTaskBase {
  readonly config!: HermsConfig;

  mtSetting = new Unit(60, 'degC');
  bkSetting = new Unit(90, 'degC');
  balanced = true;

  get userTemp(): string {
    return sparkStore.units(this.config.serviceId).Temp;
  }

  defaultTemp(degC: number): Unit {
    const defaultTempValues = { degC, degF: (degC * 9 / 5) + 32, degK: degC + 273.15 };
    return new Unit(defaultTempValues[this.userTemp] || 20, this.userTemp);
  }

  done(): void {
    const createdBlocks = defineCreatedBlocks(
      this.config,
      this.mtSetting,
      this.bkSetting,
      this.balanced);
    const changedBlocks = defineChangedBlocks(this.config);
    const layouts = defineLayouts(this.config);
    const widgets = defineWidgets(this.config, layouts);

    this.pushActions(createActions());
    this.updateConfig<HermsConfig>({
      ...this.config,
      layouts,
      widgets,
      changedBlocks,
      createdBlocks,
    });
    this.next();
  }

  mounted(): void {
    this.mtSetting = this.defaultTemp(20);
    this.bkSetting = this.defaultTemp(20);
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <big>Settings</big>
      </q-item>
      <q-item dark>
        <q-item-section>
          These are initial settings, and can also be configured later.
          <br />Elements will be disabled when created.
        </q-item-section>
      </q-item>
      <q-item dark class="align-children">
        <q-item-section>
          <q-item-label caption>
            MT setting
          </q-item-label>
          <UnitField v-model="mtSetting" title="MT setting" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            BK setting
          </q-item-label>
          <UnitField v-model="bkSetting" title="BK setting" />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-item-label caption>
            Balanced actuators
          </q-item-label>
          <q-toggle v-model="balanced" />
          <q-tooltip>
            Actuators are never turned on at the same time,
            but fairly share time turned on.
          </q-tooltip>
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
