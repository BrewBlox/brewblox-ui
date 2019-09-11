<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { Unit } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { createActions, defineChangedBlocks, defineCreatedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { HermsConfig } from './types';


@Component
export default class HermsPidTask extends WizardTaskBase {
  readonly config!: HermsConfig;
  hltFullPowerDelta = new Unit(2, 'delta_degC');
  bkFullPowerDelta = new Unit(2, 'delta_degC');
  hltVolume = 25;
  mashVolume = 25;
  limit = new Unit(10, 'delta_degC');
  mashTarget = new Unit(67, 'delta_degC');
  mashActual = new Unit(65, 'delta_degC');

  get hltKp(): Unit {
    return new Unit(100 / (this.hltFullPowerDelta.value || 2), `1/${this.userTemp}`);
  }

  get bkKp(): Unit {
    return new Unit(100 / (this.bkFullPowerDelta.value || 2), `1/${this.userTemp}`);
  }

  get mtKp(): Unit {
    return new Unit(this.mashVolume / this.hltVolume, `1/${this.userTemp}`);
  }

  get hltSetting(): Unit {
    if (this.mashTarget.value && this.mtKp.value && this.mashActual.value && this.limit.value) {
      const upperLimit = this.mashTarget.value + this.limit.value;
      const lowerLimit = this.mashTarget.value - this.limit.value;
      const setting = this.mashTarget.value + (this.mashTarget.value - this.mashActual.value) * this.mtKp.value;

      return new Unit(
        Math.min(upperLimit, Math.max(lowerLimit, setting))
        , this.userTemp);
    }
    return new Unit(null, this.userTemp);
  }

  get userTemp(): string {
    return sparkStore.units(this.config.serviceId).Temp;
  }

  defaultDelta(): Unit {
    const degC = 2;
    const defaultTempValues = { degC, degF: (degC * 9 / 5), degK: degC + 273.15 };
    return new Unit(defaultTempValues[this.userTemp] || 2, `delta_${this.userTemp}`);
  }

  done(): void {
    const createdBlocks = defineCreatedBlocks(this.config);
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
}
</script>

<template>
  <div>
    <q-card-section class="text-weight-light">
      <q-item dark>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-primary">
            PID configuration
          </q-item-label>
          <p>
            This HERMS setup uses 3 PIDs to control your temperatures.
            Click the underlined values below to edit.
          </p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-primary">
            Hot liquor tun heating
          </q-item-label>
          <p>
            If the temperature is more than
            <UnitField v-model="hltFullPowerDelta" title="Fridge setting" tag="span" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the HLT PID will be set to {{ hltKp }}.
          </p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-primary">
            Brew kettle heating
          </q-item-label>
          <p>
            If the temperature is more than
            <UnitField v-model="bkFullPowerDelta" title="Fridge setting" tag="span" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the BK PID will be set to {{ bkKp }}.
          </p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-primary">
            Mash tun heating
          </q-item-label>
          <p>
            To heat the wort in your mash tun, it is pumped through a coil in the HLT.
            <br />
            We don't want to use a static HLT temperature a bit higher than the mash tun.
            <br />
            We can do better than that, by using a third PID to change the HLT setpoint dynamically.
          </p>
          <p>
            More water in the HLT means it builds up more heat to eventually transfer to the MT,
            so with less water in the HLT, we can use a higher temperature without overshooting.
            Best is to only fill your HLT to just above your HERMS coil while step mashing.
          </p>
          <p>
            To calculate your Kp, enter the actual amount of water used, not the Kettle size.
            The unit doesn't matter. Also set the maximum difference between MT and HLT setting.
          </p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            HLT volume
          </q-item-label>
          <q-input v-model="hltVolume" dense type="number" dark />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            HLT volume
          </q-item-label>
          <q-input v-model="mashVolume" dense type="number" dark />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Limit difference to
          </q-item-label>
          <q-field dark dense color="white">
            <UnitField v-model="limit" title="Max between HLT and MT setpoint"
                       class="q-mt-sm col" tag="span"
            />
          </q-field>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>
          <p class="text-italic">
            Kp will be set to {{ mtKp }}.
            If your mash temperature is
            <UnitField v-model="mashActual" tag="span" />
            and should be
            <UnitField v-model="mashTarget" tag="span" />
            the HLT will be set to
            {{ hltSetting }}.
          </p>
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
