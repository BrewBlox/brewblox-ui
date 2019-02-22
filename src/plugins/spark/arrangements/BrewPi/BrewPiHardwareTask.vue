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
      .map(block => ({ label: block.id, value: block.id }));
  }

  get sensorOptions() {
    return blockValues(this.$store, this.cfg.serviceId)
      .filter(block => block.type === sensorOneWireType || block.type === sensorMockType)
      .map(block => ({ label: block.id, value: block.id }));
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
    console.log(JSON.stringify(this.cfg));
    this.finish();
  }
}
</script>

<template>
  <q-card dark>
    <q-card-actions>
      <q-btn :disable="!valuesOk" label="Next" color="primary" @click="next"/>
    </q-card-actions>
    <q-card-main class="row">
      <div>
        <q-list no-border>
          <q-item class="column">
            <big>Hardware Blocks</big>
          </q-item>
          <q-item>
            <q-btn label="Discover sensors" color="primary" @click="discover"/>
          </q-item>
          <q-item>
            <q-select
              v-model="coolPin"
              :error="!coolPin || coolPin === heatPin"
              :options="pinOptions"
              :float-label="cfg.names.coolPin"
            />
          </q-item>
          <q-item>
            <q-select
              v-model="heatPin"
              :error="!heatPin || coolPin === heatPin"
              :options="pinOptions"
              :float-label="cfg.names.heatPin"
            />
          </q-item>
          <q-item>
            <q-select
              v-model="fridgeSensor"
              :error="!fridgeSensor || fridgeSensor === beerSensor"
              :options="sensorOptions"
              :float-label="cfg.names.fridgeSensor"
            />
          </q-item>
          <q-item>
            <q-select
              v-model="beerSensor"
              :error="!beerSensor || fridgeSensor === beerSensor"
              :options="sensorOptions"
              :float-label="cfg.names.beerSensor"
            />
          </q-item>
        </q-list>
      </div>
    </q-card-main>
  </q-card>
</template>
