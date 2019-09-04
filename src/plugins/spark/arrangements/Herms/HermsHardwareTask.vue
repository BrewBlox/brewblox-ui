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
  hltSensor: string | null = null;
  mtSensor: string | null = null;
  bkSensor: string | null = null;

  get pinOptions(): SelectOption[] {
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

  get sensorOptions(): string[] {
    return sparkStore.blockValues(this.config.serviceId)
      .filter(block => block.type === sensorOneWireType || block.type === sensorMockType)
      .map(block => block.id);
  }

  get valuesOk(): boolean {
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

  get userTemp(): string {
    return sparkStore.units(this.config.serviceId).Temp;
  }

  sensorTemp(id: string | null): string {
    if (!id) {
      return 'Select a sensor to show current value';
    }
    return sparkStore.blockById(this.config.serviceId, id).data.value.toString();
  }

  get hltSensorTemp(): string {
    return this.sensorTemp(this.hltSensor);
  }

  get bkSensorTemp(): string {
    return this.sensorTemp(this.bkSensor);
  }

  get mtSensorTemp(): string {
    return this.sensorTemp(this.mtSensor);
  }

  pinConnectedStatus(channel: PinChannel | null): string {
    if (!channel) {
      return 'Select a channel to show status';
    }
    const block = sparkStore.blockById(this.config.serviceId, channel.arrayId);
    if ([Spark2PinsType, Spark3PinsType].includes(block.type)) {
      return '';
    }
    return block.data.connected
      ? `${channel.arrayId} is connected`
      : `${channel.arrayId} is not connected`;
  }

  get hltPinStatus(): string {
    return this.pinConnectedStatus(this.hltPin);
  }

  get bkPinStatus(): string {
    return this.pinConnectedStatus(this.bkPin);
  }

  created(): void {
    this.discover();
  }

  discover(): void {
    sparkStore.fetchDiscoveredBlocks(this.config.serviceId);
  }

  startBlockWizard(): void {
    Dialog.create({
      component: 'BlockWizardDialog',
      serviceId: this.config.serviceId,
      root: this.$root,
    });
  }

  taskDone(): void {
    this.config.bkPin = this.bkPin as PinChannel;
    this.config.hltPin = this.hltPin as PinChannel;

    Object.assign(
      this.config.renamedBlocks,
      {
        [this.hltSensor as string]: this.config.names.hltSensor,
        [this.mtSensor as string]: this.config.names.mtSensor,
        [this.bkSensor as string]: this.config.names.bkSensor,
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
        <q-item-section>
          <big>Hardware Blocks</big>
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
      <q-item dark>
        <q-item-section class="text-italic">
          You can unplug or heat sensors to identify them.
          The current value will be shown under each dropdown menu.
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="hltPin"
            :options="pinOptions"
            :rules="pinRules"
            :hint="hltPinStatus"
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
            :hint="bkPinStatus"
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
            :rules="sensorRules"
            :hint="hltSensorTemp"
            label="HLT sensor"
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="bkSensor"
            :options="sensorOptions"
            :rules="sensorRules"
            :hint="bkSensorTemp"
            label="BK sensor"
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
            :rules="sensorRules"
            :hint="mtSensorTemp"
            label="MT sensor"
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
