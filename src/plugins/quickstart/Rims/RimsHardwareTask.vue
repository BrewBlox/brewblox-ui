<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import WizardTaskBase from '../components/WizardTaskBase';
import { createOutputActions, hasShared } from '../helpers';
import { PinChannel } from '../types';
import { defineChangedBlocks, defineCreatedBlocks, defineWidgets } from './changes';
import { defineLayouts } from './changes-layout';
import { RimsConfig } from './types';


@Component
export default class RimsHardwareTask extends WizardTaskBase<RimsConfig> {
  tubePin: PinChannel | null = null;
  pumpPin: PinChannel | null = null;
  kettleSensor: string | null = null;
  tubeSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.tubePin,
      this.pumpPin,
      !this.pinSame,
      this.kettleSensor,
      this.tubeSensor,
      !this.sensorSame,
    ]
      .every(Boolean);
  }

  get pinSame(): boolean {
    return hasShared([this.tubePin, this.pumpPin]);
  }

  get sensorSame(): boolean {
    return hasShared([this.kettleSensor, this.tubeSensor]);
  }

  created(): void {
    this.discover();

    this.tubePin = this.config.tubePin || null;
    this.pumpPin = this.config.pumpPin || null;
    this.kettleSensor = this.config.kettleSensor || null;
    this.tubeSensor = this.config.tubeSensor || null;
  }

  discover(): void {
    sparkStore.fetchDiscoveredBlocks(this.config.serviceId);
  }

  startBlockWizard(): void {
    createDialog({
      component: 'BlockWizardDialog',
      serviceId: this.config.serviceId,
      parent: this,
    });
  }

  taskDone(): void {
    this.config.tubePin = this.tubePin!;
    this.config.pumpPin = this.pumpPin!;
    this.config.kettleSensor = this.kettleSensor!;
    this.config.tubeSensor = this.tubeSensor!;

    this.config.renamedBlocks = {
      [this.kettleSensor!]: this.config.names.kettleSensor,
      [this.tubeSensor!]: this.config.names.tubeSensor,
    };

    const createdBlocks = defineCreatedBlocks(this.config);
    const changedBlocks = defineChangedBlocks(this.config);
    const layouts = defineLayouts(this.config);
    const widgets = defineWidgets(this.config, layouts);

    this.pushActions(createOutputActions());
    this.updateConfig({
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
        <q-item-section>
          <QuickStartPinField
            v-model="pumpPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Pump"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-model="tubePin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Tube heater"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="kettleSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Kettle Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartSensorField
            v-model="tubeSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Tube Sensor"
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
