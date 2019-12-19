<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import WizardTaskBase from '../components/WizardTaskBase';
import { hasShared } from '../helpers';
import { PinChannel } from '../types';
import { HermsConfig } from './types';


@Component
export default class HermsHardwareTask extends WizardTaskBase<HermsConfig> {
  hltPin: PinChannel | null = null;
  bkPin: PinChannel | null = null;
  hltSensor: string | null = null;
  mtSensor: string | null = null;
  bkSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.hltPin,
      this.bkPin,
      !this.pinSame,
      this.hltSensor,
      this.mtSensor,
      this.bkSensor,
      !this.sensorSame,
    ]
      .every(Boolean);
  }

  get pinSame(): boolean {
    return hasShared([this.hltPin, this.bkPin]);
  }

  get sensorSame(): boolean {
    return hasShared([this.hltSensor, this.mtSensor, this.bkSensor]);
  }

  created(): void {
    this.discover();

    this.hltPin = this.config.hltPin || null;
    this.bkPin = this.config.bkPin || null;
    this.hltSensor = this.config.hltSensor || null;
    this.mtSensor = this.config.mtSensor || null;
    this.bkSensor = this.config.bkSensor || null;
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
    this.config.bkPin = this.bkPin!;
    this.config.hltPin = this.hltPin!;
    this.config.hltSensor = this.hltSensor!;
    this.config.mtSensor = this.mtSensor!;
    this.config.bkSensor = this.bkSensor!;

    this.config.renamedBlocks = {
      [this.hltSensor!]: this.config.names.hltSensor,
      [this.mtSensor!]: this.config.names.mtSensor,
      [this.bkSensor!]: this.config.names.bkSensor,
    };

    this.updateConfig(this.config);
    this.next();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item>
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
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            Select which hardware should be used for each function.<br>
            You can unplug or heat sensors to identify them.
            The current value will be shown under each dropdown menu.
          </p>
          <p>
            Use the buttons above to discover new OneWire blocks or manually create a block.
          </p>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuickStartPinField
            v-model="hltPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="HLT output"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-model="bkPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="BK output"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuickStartSensorField
            v-model="hltSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="HLT Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartSensorField
            v-model="bkSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="BK Sensor"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuickStartSensorField
            v-model="mtSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="MT Sensor"
          />
        </q-item-section>
        <q-item-section />
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

    <q-separator />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
