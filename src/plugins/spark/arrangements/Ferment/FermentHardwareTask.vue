<script lang="ts">
import isEqual from 'lodash/isEqual';
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { FermentConfig, PinChannel } from '@/plugins/spark/arrangements/Ferment/types';
import { typeName as DS2413Type } from '@/plugins/spark/features/DS2413/getters';
import { typeName as Spark2PinsType } from '@/plugins/spark/features/Spark2Pins/getters';
import { typeName as Spark3PinsType } from '@/plugins/spark/features/Spark3Pins/getters';
import { typeName as sensorMockType } from '@/plugins/spark/features/TempSensorMock/getters';
import { typeName as sensorOneWireType } from '@/plugins/spark/features/TempSensorOneWire/getters';
import sparkStore from '@/plugins/spark/store';


@Component
export default class FermentHardwareTask extends WizardTaskBase {
  readonly config!: FermentConfig;

  coolPin: PinChannel | null = null;
  heatPin: PinChannel | null = null;
  fridgeSensor: any = null;
  beerSensor: any = null;

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

  next() {
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
    this.pushTask('FermentSettingsTask');
    this.finish();
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
          <q-btn unelevated label="Discover OneWire objects" color="primary" @click="discover"/>
          <q-tooltip>
            OneWire temperature sensors and DS2413 chips can be discovered:
            the Block will be created automatically.
          </q-tooltip>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn unelevated label="Create block" color="primary" @click="startBlockWizard"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="coolPin"
            :options="pinOptions"
            :rules="pinRules"
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
            :label="config.names.fridgeSensor"
            :rules="sensorRules"
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="beerSensor"
            :options="sensorOptions"
            :label="config.names.beerSensor"
            :rules="sensorRules"
            dark
            options-dark
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark/>

    <q-card-actions>
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        class="full-width"
        @click="next"
      />
    </q-card-actions>
  </div>
</template>
