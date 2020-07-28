<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Qty, Temp } from '@/plugins/spark/bloxfield';
import { sparkStore } from '@/plugins/spark/store';

import WizardTaskBase from '../components/WizardTaskBase';
import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { HermsConfig, HermsOpts } from './types';


@Component
export default class HermsSettingsTask extends WizardTaskBase<HermsConfig> {
  hltFullPowerDelta = new Temp(2, 'delta_degC');
  bkFullPowerDelta = new Temp(2, 'delta_degC');
  hltVolume = 25;
  mashVolume = 25;
  driverMax = new Temp(10, 'delta_degC');
  mashTarget = new Temp(67, 'degC');
  mashActual = new Temp(65, 'degC');

  volumeRules: InputRule[] = [
    v => v !== 0 || 'Volume can\'t be 0',
  ]

  created(): void {
    const deltaTemp = `delta_${this.userTemp}`;
    this.hltFullPowerDelta = this.hltFullPowerDelta.convert(deltaTemp);
    this.bkFullPowerDelta = this.bkFullPowerDelta.convert(deltaTemp);
    this.driverMax = this.driverMax.convert(deltaTemp);

    this.mashTarget = this.mashTarget.convert(this.userTemp);
    this.mashActual = this.mashActual.convert(this.userTemp);
  }

  get userTemp(): string {
    return sparkStore.moduleById(this.config.serviceId)!.units.Temp;
  }

  get hltKp(): Qty {
    return new Qty(100 / (this.hltFullPowerDelta.value || 2), `1/${this.userTemp}`);
  }

  get bkKp(): Qty {
    return new Qty(100 / (this.bkFullPowerDelta.value || 2), `1/${this.userTemp}`);
  }

  get mtKp(): Qty {
    return new Qty(this.mashVolume / (this.hltVolume || 1), `1/${this.userTemp}`);
  }

  get hltSetting(): Qty {
    if (this.mashTarget.value && this.mtKp.value && this.mashActual.value && this.driverMax.value) {
      const upperLimit = this.mashTarget.value + this.driverMax.value;
      const setting = this.mashTarget.value + (this.mashTarget.value - this.mashActual.value) * this.mtKp.value;

      return new Qty(Math.min(upperLimit, setting), this.userTemp);
    }
    return new Qty(null, this.userTemp);
  }

  editHLTDelta(): void {
    createDialog({
      component: 'UnitDialog',
      title: 'Full power delta',
      value: this.hltFullPowerDelta,
    })
      .onOk(v => this.hltFullPowerDelta = v);
  }

  done(): void {
    const opts: HermsOpts = {
      hltKp: this.hltKp,
      bkKp: this.bkKp,
      mtKp: this.mtKp,
      driverMax: this.driverMax,
    };

    const createdBlocks = defineCreatedBlocks(this.config, opts);
    const changedBlocks = defineChangedBlocks(this.config);
    const layouts = defineLayouts(this.config);
    const widgets = defineWidgets(this.config, layouts);
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
            PID configuration
          </q-item-label>
          <p>
            This HERMS setup uses 3 PIDs to control your temperatures.
            Click the underlined values below to edit.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Hot liquor tun heating
          </q-item-label>
          <p>
            If the temperature is more than
            <InlineUnitField v-model="hltFullPowerDelta" title="Full power delta" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the HLT PID will be set to {{ hltKp }}.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Brew kettle heating
          </q-item-label>
          <p>
            If the temperature is more than
            <InlineUnitField v-model="bkFullPowerDelta" title="Full power delta" /> too low,
            run at full power (100%).
          </p>
          <p class="text-italic">
            Proportional gain Kp of the BK PID will be set to {{ bkKp }}.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Mash tun heating
          </q-item-label>
          <p>
            To heat the wort in your mash tun, it is pumped through a coil in the HLT.
            <br>
            We don't want to use a static HLT temperature a bit higher than the mash tun.
            <br>
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
      <q-item class="items-baseline">
        <q-item-section>
          <q-input
            v-model="hltVolume"
            :rules="volumeRules"
            inputmode="numeric"
            pattern="[0-9]*"
            label="HLT volume"
          />
        </q-item-section>
        <q-item-section>
          <q-input
            v-model="mashVolume"
            :rules="volumeRules"
            inputmode="numeric"
            pattern="[0-9]*"
            label="Mash volume"
          />
        </q-item-section>
        <q-item-section>
          <q-input
            v-model.number="driverMax.value"
            inputmode="numeric"
            pattern="[0-9]*"
            label="Limit difference to"
          >
            <template #append>
              <small class="self-end q-pb-sm">
                {{ driverMax.notation }}
              </small>
            </template>
          </q-input>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <p class="text-italic">
            Kp will be set to {{ mtKp }}.
            If your mash temperature is
            <InlineUnitField v-model="mashActual" style="font-style: normal" />
            and should be
            <InlineUnitField v-model="mashTarget" style="font-style: normal" />
            the HLT will be set to
            {{ hltSetting }}.
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
