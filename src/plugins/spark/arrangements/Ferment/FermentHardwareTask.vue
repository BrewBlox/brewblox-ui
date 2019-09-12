<script lang="ts">
import isEqual from 'lodash/isEqual';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { createDialog } from '@/helpers/dialog';
import { FermentConfig, PinChannel } from '@/plugins/spark/arrangements/Ferment/types';
import { typeName as DS2413Type } from '@/plugins/spark/features/DS2413/getters';
import { typeName as Spark2PinsType } from '@/plugins/spark/features/Spark2Pins/getters';
import { typeName as Spark3PinsType } from '@/plugins/spark/features/Spark3Pins/getters';
import { typeName as sensorMockType } from '@/plugins/spark/features/TempSensorMock/getters';
import { typeName as sensorOneWireType } from '@/plugins/spark/features/TempSensorOneWire/getters';
import { sparkStore } from '@/plugins/spark/store';


@Component
export default class FermentHardwareTask extends WizardTaskBase {
  readonly config!: FermentConfig;

  coolPin: PinChannel | null = null;
  heatPin: PinChannel | null = null;
  fridgeSensor: any = null;
  beerSensor: any = null;

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
      this.coolPin,
      this.heatPin,
      !isEqual(this.coolPin, this.heatPin),
      this.fridgeSensor,
      this.beerSensor,
      this.fridgeSensor !== this.beerSensor,
    ]
      .every(Boolean);
  }

  get pinRules(): InputRule[] {
    return [
      v => !!v || 'Pin must be selected',
      () => !isEqual(this.coolPin, this.heatPin) || 'Cool pin and Heat pin may not be the same',
    ];
  }

  get sensorRules(): InputRule[] {
    return [
      v => !!v || 'Sensor must be selected',
      () => this.fridgeSensor !== this.beerSensor || 'Fridge sensor and Beer sensor may not be the same',
    ];
  }

  sensorTemp(id: string | null): string {
    if (!id) {
      return '';
    }
    return sparkStore.blockById(this.config.serviceId, id).data.value.toString();
  }

  get fridgeSensorTemp(): string {
    return this.sensorTemp(this.fridgeSensor);
  }

  get beerSensorTemp(): string {
    return this.sensorTemp(this.beerSensor);
  }

  pinConnectedStatus(channel: PinChannel | null): string {
    if (!channel) {
      return '';
    }
    const block = sparkStore.blockById(this.config.serviceId, channel.arrayId);
    if ([Spark2PinsType, Spark3PinsType].includes(block.type)) {
      return '';
    }
    return block.data.connected
      ? `${channel.arrayId} is connected`
      : `${channel.arrayId} is not connected`;
  }

  get coolPinStatus(): string {
    return this.pinConnectedStatus(this.coolPin);
  }

  get heatPinStatus(): string {
    return this.pinConnectedStatus(this.heatPin);
  }

  created(): void {
    this.discover();
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
    this.config.heatPin = this.heatPin as PinChannel;
    this.config.coolPin = this.coolPin as PinChannel;

    Object.assign(
      this.config.renamedBlocks,
      {
        [this.fridgeSensor]: this.config.names.fridgeSensor,
        [this.beerSensor]: this.config.names.beerSensor,
      },
    );

    this.updateConfig<FermentConfig>(this.config);
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
          <p>
            We will also set some constraints on the heater and cooler:
            <ul>
              <li>Minimum ON and OFF times to protect the compressor</li>
              <li>Minimum wait times for switching between heating and cooling</li>
            </ul>
          </p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="coolPin"
            :options="pinOptions"
            :rules="pinRules"
            :hint="coolPinStatus"
            label="Cooler output"
            emit-value
            map-options
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="heatPin"
            :options="pinOptions"
            :rules="pinRules"
            :hint="heatPinStatus"
            label="Heater output"
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
            v-model="fridgeSensor"
            :options="sensorOptions"
            label="Fridge Sensor"
            :rules="sensorRules"
            :hint="fridgeSensorTemp"
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="beerSensor"
            :options="sensorOptions"
            label="Beer Sensor"
            :rules="sensorRules"
            :hint="beerSensorTemp"
            dark
            options-dark
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
