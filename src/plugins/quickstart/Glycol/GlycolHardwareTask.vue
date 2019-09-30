<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import { hasShared } from '../helpers';
import { PinChannel } from '../types';
import { GlycolConfig } from './types';


@Component
export default class GlycolHardwareTask extends WizardTaskBase<GlycolConfig> {
  heated = false;
  glycolControl: 'No' | 'Measure' | 'Control' = 'No';
  coolPin: PinChannel | null = null;
  heatPin: PinChannel | null = null;
  glycolPin: PinChannel | null = null;
  beerSensor: string | null = null;
  glycolSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.coolPin,
      this.heatPin || !this.heated,
      this.glycolPin || this.glycolControl !== 'Control',
      !this.pinSame,
      this.beerSensor,
      this.glycolSensor,
      !this.sensorSame,
    ]
      .every(Boolean);
  }

  get pinSame(): boolean {
    return this.heated && hasShared([this.coolPin, this.heatPin, this.glycolPin])
      || this.glycolControl === 'Control' && hasShared([this.coolPin, this.heatPin, this.glycolPin]);
  }

  get sensorSame(): boolean {
    return this.glycolControl !== 'No' && hasShared([this.beerSensor, this.glycolSensor]);
  }


  created(): void {
    this.discover();

    this.heated = this.config.heated || false;
    this.coolPin = this.config.coolPin || null;
    this.heatPin = this.config.heatPin || null;
    this.glycolPin = this.config.glycolPin || null;
    this.beerSensor = this.config.beerSensor || null;
    this.glycolSensor = this.config.glycolSensor || null;
    this.glycolControl = this.config.glycolControl || 'No';
  }

  discover(): void {
    sparkStore.fetchDiscoveredBlocks(this.config.serviceId);
  }

  startBlockWizard(): void {
    createDialog({
      component: 'BlockWizardDialog',
      serviceId: this.config.serviceId,
      root: this.$root,
    });
  }

  taskDone(): void {
    this.config.heated = this.heated;
    this.config.heatPin = this.heated ? this.heatPin : null;
    this.config.coolPin = this.coolPin!;
    this.config.beerSensor = this.beerSensor!;
    this.config.glycolSensor = this.glycolSensor!;
    this.config.glycolControl = this.glycolControl;
    this.config.glycolPin = this.glycolControl === 'Control' ? this.glycolPin : null;


    this.config.renamedBlocks = {
      [this.beerSensor!]: this.config.names.beerSensor,
    };

    if (this.glycolControl !== 'No') {
      this.config.renamedBlocks[this.glycolSensor!] = this.config.names.glycolSensor;
    }

    this.updateConfig(this.config);
    this.next();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Assign Hardware Blocks
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="refresh" @click="discover">
            <q-tooltip>Discover OneWire Blocks</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="add" @click="startBlockWizard">
            <q-tooltip>Create new Block</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <q-item dark class="text-weight-light">
        <q-item-section>
          <p>
            Select which hardware should be used for each function.<br />
            You can unplug or heat sensors to identify them.
            The current value will be shown under each dropdown menu.
          </p>
          <p>
            Use the buttons above to discover new OneWire blocks or manually create a block.
          </p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section class="col-5">
          <q-item-label caption>
            Does your fermenter have a heater?
          </q-item-label>
          <div class="q-gutter-lg">
            <q-radio
              v-model="heated"
              dark
              :val="false" label="No"
            />
            <q-radio
              v-model="heated"
              dark
              :val="true" label="Yes"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Should BrewBlox manage glycol temperature?
          </q-item-label>
          <div class="q-gutter-lg">
            <q-radio
              v-model="glycolControl"
              dark
              val="No" label="No"
            />
            <q-radio
              v-model="glycolControl"
              dark
              val="Measure" label="Measure only"
            />
            <q-radio
              v-model="glycolControl"
              dark
              val="Control" label="Actively controlled"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="beerSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Beer Sensor"
          />
        </q-item-section>
        <q-item-section />
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartPinField
            v-model="coolPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Glycol pump output"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-if="heated"
            v-model="heatPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Heater output"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="glycolControl !== 'No'" dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="glycolSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Glycol Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-if="glycolControl === 'Control'"
            v-model="glycolPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Glycol chiller output"
          />
        </q-item-section>
      </q-item>
      <CardWarning v-if="pinSame">
        <template #message>
          Multiple outputs are using the same Pin.
        </template>
      </CardWarning>
      <CardWarning v-if="sensorSame">
        <template #message>
          Multiple sensors are using the same Block.
        </template>
      </CardWarning>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
