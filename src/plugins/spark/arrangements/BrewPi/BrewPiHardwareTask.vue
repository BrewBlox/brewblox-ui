<script lang="ts">
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import sparkStore from '@/plugins/spark/store';
import { BrewPiConfig } from '@/plugins/spark/arrangements/BrewPi/state';
import { typeName as actuatorPinType } from '@/plugins/spark/features/ActuatorPin/getters';
import { typeName as actuatorDS2413Type } from '@/plugins/spark/features/ActuatorDS2413/getters';
import { typeName as sensorOneWireType } from '@/plugins/spark/features/TempSensorOneWire/getters';
import { typeName as sensorMockType } from '@/plugins/spark/features/TempSensorMock/getters';


@Component
export default class BrewPiHardwareTask extends WizardTaskBase {
  blockWizardModalOpen: boolean = false;

  coolPin: any = null;
  heatPin: any = null;
  fridgeSensor: any = null;
  beerSensor: any = null;

  get cfg(): BrewPiConfig {
    return this.stagedConfig;
  }

  get pinOptions() {
    const pinTypes = [actuatorPinType, actuatorDS2413Type];
    return sparkStore.blockValues(this.cfg.serviceId)
      .filter(block => pinTypes.includes(block.type))
      .map(block => block.id);
  }

  get sensorOptions() {
    return sparkStore.blockValues(this.cfg.serviceId)
      .filter(block => block.type === sensorOneWireType || block.type === sensorMockType)
      .map(block => block.id);
  }

  get valuesOk() {
    return [
      this.coolPin,
      this.heatPin,
      this.coolPin !== this.heatPin,
      this.fridgeSensor,
      this.beerSensor,
      this.fridgeSensor !== this.beerSensor,
    ]
      .every(Boolean);
  }

  get pinRules(): InputRule[] {
    return [
      v => !!v || 'Pin must be selected',
      () => this.coolPin !== this.heatPin || 'Cool pin and Heat pin may not be the same',
    ];
  }

  get sensorRules(): InputRule[] {
    return [
      v => !!v || 'Sensor must be selected',
      () => this.fridgeSensor !== this.beerSensor || 'Fridge sensor and Beer sensor may not be the same',
    ];
  }

  mounted() {
    this.discover();
  }

  discover() {
    sparkStore.fetchDiscoveredBlocks(this.cfg.serviceId);
  }

  next() {
    Object.assign(
      this.cfg.renamedBlocks,
      {
        [this.coolPin]: this.cfg.names.coolPin,
        [this.heatPin]: this.cfg.names.heatPin,
        [this.fridgeSensor]: this.cfg.names.fridgeSensor,
        [this.beerSensor]: this.cfg.names.beerSensor,
      },
    );

    this.updateConfig<BrewPiConfig>(this.cfg);
    this.pushTask('BrewPiSettingsTask');
    this.finish();
  }
}
</script>

<template>
  <div>
    <q-dialog v-model="blockWizardModalOpen" no-backdrop-dismiss>
      <BlockWizard
        v-if="blockWizardModalOpen"
        :service-id="cfg.serviceId"
        @close="blockWizardModalOpen = false"
      />
    </q-dialog>
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
          <q-btn
            unelevated
            label="Create block"
            color="primary"
            @click="blockWizardModalOpen = true"
          />
          <q-tooltip>
            Example cases where a Block must be created and configured manually:
            <ul>
              <li>When using DS2413 actuators.</li>
              <li>When using mock temperature sensors.</li>
            </ul>
          </q-tooltip>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-select
            v-model="coolPin"
            :options="pinOptions"
            :label="cfg.names.coolPin"
            :rules="pinRules"
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="heatPin"
            :options="pinOptions"
            :label="cfg.names.heatPin"
            :rules="pinRules"
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
            :label="cfg.names.fridgeSensor"
            :rules="sensorRules"
            dark
            options-dark
          />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="beerSensor"
            :options="sensorOptions"
            :label="cfg.names.beerSensor"
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
