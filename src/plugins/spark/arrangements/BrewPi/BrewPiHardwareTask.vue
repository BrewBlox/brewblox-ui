<script lang="ts">
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { blockValues } from '@/plugins/spark/store/getters';
import { BrewPiConfig } from '@/plugins/spark/arrangements/BrewPi/state';
import { typeName as pinType } from '@/plugins/spark/features/ActuatorPin/getters';
import { typeName as sensorOneWireType } from '@/plugins/spark/features/TempSensorOneWire/getters';
import { typeName as sensorMockType } from '@/plugins/spark/features/TempSensorMock/getters';
import { fetchDiscoveredBlocks } from '@/plugins/spark/store/actions';


@Component
export default class BrewPiHardwareTask extends WizardTaskBase {
  coolPin: any = null;
  heatPin: any = null;
  fridgeSensor: any = null;
  beerSensor: any = null;

  get cfg(): BrewPiConfig {
    return this.stagedConfig;
  }

  get pinOptions() {
    return blockValues(this.$store, this.cfg.serviceId)
      .filter(block => block.type === pinType)
      .map(block => block.id);
  }

  get sensorOptions() {
    return blockValues(this.$store, this.cfg.serviceId)
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
    fetchDiscoveredBlocks(this.$store, this.cfg.serviceId);
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
    <q-card-section>
      <q-item>
        <big>Hardware Blocks</big>
      </q-item>
      <q-item dark>
        <q-btn label="Discover sensors" color="primary" @click="discover"/>
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
