<script lang="ts">
import isEqual from 'lodash/isEqual';
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { typeName as DS2413Type } from '@/plugins/spark/features/DS2413/getters';
import { typeName as Spark2PinsType } from '@/plugins/spark/features/Spark2Pins/getters';
import { typeName as Spark3PinsType } from '@/plugins/spark/features/Spark3Pins/getters';
import { typeName as sensorMockType } from '@/plugins/spark/features/TempSensorMock/getters';
import { typeName as sensorOneWireType } from '@/plugins/spark/features/TempSensorOneWire/getters';
import { sparkStore } from '@/plugins/spark/store';

import { HermsConfig, PinChannel } from './types';


@Component
export default class HermsHardwareTask extends WizardTaskBase {
  readonly config!: HermsConfig;

  hltPin: PinChannel | null = null;
  bkPin: PinChannel | null = null;
  hltSensor: any = null;
  mtSensor: any = null;
  bkSensor: any = null;

  get pinOptions() {
    return sparkStore.blockValues(this.config.serviceId)
      .filter(block => [Spark2PinsType, Spark3PinsType, DS2413Type].includes(block.type))
      .reduce(
        (acc, block) => [
          ...acc,
          ...block.data.pins.map((pin, idx) => {
            const [pinName] = Object.keys(block.data.pins[idx]);
            return { pinName, arrayId: block.id, pinId: idx + 1 };
          }),
        ],
        [] as any[])
      .map(channel => ({ label: `${channel.arrayId} ${channel.pinName}`, value: channel }));
  }

  get sensorOptions() {
    return sparkStore.blockValues(this.config.serviceId)
      .filter(block => block.type === sensorOneWireType || block.type === sensorMockType)
      .map(block => block.id);
  }

  get valuesOk() {
    return [
      this.hltPin,
      this.bkPin,
      !isEqual(this.hltPin, this.bkPin),
      this.hltSensor,
      this.mtSensor,
      this.bkSensor,
      this.hltSensor !== this.mtSensor,
      this.hltSensor !== this.bkSensor,
      this.mtSensor !== this.bkSensor,
    ]
      .every(Boolean);
  }

  get pinRules(): InputRule[] {
    return [
      v => !!v || 'Pin must be selected',
      () => !isEqual(this.hltPin, this.bkPin) || 'HLT pin and BK pin may not be the same',
    ];
  }

  get sensorRules(): InputRule[] {
    return [
      v => !!v || 'Sensor must be selected',
    ];
  }

  get sensorSame(): boolean {
    if (!this.hltSensor || !this.mtSensor || !this.bkSensor) {
      return false;
    }
    return [
      this.hltSensor === this.mtSensor,
      this.hltSensor === this.bkSensor,
      this.mtSensor === this.bkSensor,
    ].some(Boolean);
  }

  created() {
    this.discover();
  }

  discover() {
    sparkStore.fetchDiscoveredBlocks(this.config.serviceId);
  }

  startBlockWizard() {
    Dialog.create({
      component: 'BlockWizardDialog',
      serviceId: this.config.serviceId,
      root: this.$root,
    });
  }

  taskDone() {
    this.config.bkPin = this.bkPin as PinChannel;
    this.config.hltPin = this.hltPin as PinChannel;

    Object.assign(
      this.config.renamedBlocks,
      {
        [this.hltSensor]: this.config.names.hltSensor,
        [this.mtSensor]: this.config.names.mtSensor,
        [this.bkSensor]: this.config.names.bkSensor,
      },
    );

    this.updateConfig<HermsConfig>(this.config);
    this.next();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item>
        <big>Hardware Blocks</big>
      </q-item>
      <q-item dark>
        <q-item-section class="col-auto">
          <q-btn unelevated label="Discover OneWire objects" color="primary" @click="discover" />
          <q-tooltip>
            OneWire temperature sensors and DS2413 chips can be discovered:
            the Block will be created automatically.
          </q-tooltip>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn unelevated label="Create block" color="primary" @click="startBlockWizard" />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="hltPin"
            :options="pinOptions"
            :rules="pinRules"
            label="HLT output"
            emit-value
            map-options
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="bkPin"
            :options="pinOptions"
            :rules="pinRules"
            label="BK output"
            emit-value
            map-options
            dark
            options-dark
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="hltSensor"
            :options="sensorOptions"
            label="HLT sensor"
            :rules="sensorRules"
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="bkSensor"
            :options="sensorOptions"
            label="BK sensor"
            :rules="sensorRules"
            dark
            options-dark
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="mtSensor"
            :options="sensorOptions"
            label="MT sensor"
            :rules="sensorRules"
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section />
      </q-item>
      <CardWarning v-if="sensorSame">
        <template #message>
          One or more sensors are using the same Block.
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
