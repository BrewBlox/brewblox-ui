<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import WizardTaskBase from '../components/WizardTaskBase';
import { PinChannel } from '../types';
import { BrewKettleConfig } from './types';


@Component
export default class BrewKettleHardwareTask extends WizardTaskBase<BrewKettleConfig> {
  kettlePin: PinChannel | null = null;
  kettleSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.kettlePin,
      this.kettleSensor,
    ]
      .every(Boolean);
  }

  created(): void {
    this.discover();

    this.kettlePin = this.config.kettlePin || null;
    this.kettleSensor = this.config.kettleSensor || null;
  }

  discover(): void {
    sparkStore.moduleById(this.config.serviceId)?.fetchDiscoveredBlocks();
  }

  startBlockWizard(): void {
    createDialog({
      component: 'BlockWizardDialog',
      serviceId: this.config.serviceId,
    });
  }

  taskDone(): void {
    this.config.kettlePin = this.kettlePin!;
    this.config.kettleSensor = this.kettleSensor!;

    this.config.renamedBlocks = {
      [this.kettleSensor!]: this.config.names.kettleSensor,
    };

    this.updateConfig(this.config);
    this.next();
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Assign Hardware blocks
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="refresh" @click="discover">
            <q-tooltip>Discover OneWire blocks</q-tooltip>
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
      <QuickStartMockCreateField
        :service-id="config.serviceId"
        :names="[
          config.names.kettleSensor,
        ]"
      />
      <q-item>
        <q-item-section>
          <QuickStartPinField
            v-model="kettlePin"
            :service-id="config.serviceId"
            label="Output pin"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartSensorField
            v-model="kettleSensor"
            :service-id="config.serviceId"
            label="Sensor"
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        @click="taskDone"
      />
    </template>
  </ActionCardBody>
</template>
