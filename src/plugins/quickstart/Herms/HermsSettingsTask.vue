<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxQty, deltaTempQty, JSQuantity, prettyUnit, tempQty } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { systemStore } from '@/store/system';

import QuickStartTaskBase from '../components/QuickStartTaskBase';
import { createOutputActions } from '../helpers';
import { defineChangedBlocks, defineCreatedBlocks, defineDisplayedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { HermsConfig, HermsOpts } from './types';


@Component
export default class HermsSettingsTask extends QuickStartTaskBase<HermsConfig> {
  hltFullPowerDelta = deltaTempQty(2);
  bkFullPowerDelta = deltaTempQty(2);
  hltVolume = 25;
  mashVolume = 25;
  driverMax = deltaTempQty(10);
  mashTarget = tempQty(67);
  mashActual = tempQty(65);

  volumeRules: InputRule[] = [
    v => Number(v) !== 0 || 'Volume can\'t be 0',
  ]

  get userTemp(): string {
    return systemStore.units.temperature;
  }

  get hltKp(): JSQuantity {
    return bloxQty(100 / (this.hltFullPowerDelta.value || 2), `1/${this.userTemp}`);
  }

  get bkKp(): JSQuantity {
    return bloxQty(100 / (this.bkFullPowerDelta.value || 2), `1/${this.userTemp}`);
  }

  get mtKp(): JSQuantity {
    return bloxQty(this.mashVolume / (this.hltVolume || 1), `1/${this.userTemp}`);
  }

  get hltSetting(): JSQuantity {
    if (this.mashTarget.value && this.mtKp.value && this.mashActual.value && this.driverMax.value) {
      const upperLimit = this.mashTarget.value + this.driverMax.value;
      const setting = this.mashTarget.value + (this.mashTarget.value - this.mashActual.value) * this.mtKp.value;

      return bloxQty(Math.min(upperLimit, setting), this.userTemp);
    }
    return bloxQty(null, this.userTemp);
  }

  editHLTDelta(): void {
    createDialog({
      component: 'QuantityDialog',
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

  showHltVolumeKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      type: 'number',
      value: this.hltVolume,
      rules: this.volumeRules,
    })
      .onOk(v => this.hltVolume = v);
  }

  showMashVolumeKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      type: 'number',
      value: this.mashVolume,
      rules: this.volumeRules,
    })
      .onOk(v => this.mashVolume = v);
  }

  showDriverMaxKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      type: 'number',
      value: this.driverMax.value,
      suffix: prettyUnit(this.driverMax),
    })
      .onOk(v => this.driverMax = v);
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
            <InlineQuantityField v-model="hltFullPowerDelta" title="Full power delta" /> too low,
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
            <InlineQuantityField v-model="bkFullPowerDelta" title="Full power delta" /> too low,
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
          >
            <template #append>
              <KeyboardButton @click="showHltVolumeKeyboard" />
            </template>
          </q-input>
        </q-item-section>
        <q-item-section>
          <q-input
            v-model="mashVolume"
            :rules="volumeRules"
            inputmode="numeric"
            pattern="[0-9]*"
            label="Mash volume"
          >
            <template #append>
              <KeyboardButton @click="showMashVolumeKeyboard" />
            </template>
          </q-input>
        </q-item-section>
        <q-item-section>
          <q-input
            v-model.number="driverMax.value"
            inputmode="numeric"
            pattern="[0-9]*"
            label="Limit difference to"
          >
            <template #append>
              <KeyboardButton @click="showDriverMaxKeyboard" />
              <small class="self-end q-pb-sm">
                {{ driverMax | prettyUnit }}
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
            <InlineQuantityField v-model="mashActual" style="font-style: normal" />
            and should be
            <InlineQuantityField v-model="mashTarget" style="font-style: normal" />
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
