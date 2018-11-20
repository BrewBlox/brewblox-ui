<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { SetpointLink, TempSensorLink } from '@/helpers/units/KnownLinks';
import { blockIds } from '@/plugins/spark/store/getters';
import { Unit } from '@/helpers/units';

@Component
export default class SetpointSensorPairForm extends BlockForm {
  defaultData() {
    return {
      setpointId: new SetpointLink(null),
      sensorId: new TempSensorLink(null),
      setpointValid: true,
      sensorValid: true,
      setpointValue: new Unit(0, 'degC'),
      sensorValue: new Unit(0, 'degC'),
      valid: true,
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Setpoint">
          <LinkPopupEdit label="Setpoint" :field="block.data.setpointId" :serviceId="serviceId" :change="callAndSaveBlock(v => block.data.setpointId = v)" />
        </q-field>
        <q-field class="col" label="Sensor">
          <LinkPopupEdit label="Sensor" :field="block.data.sensorId" :serviceId="serviceId" :change="callAndSaveBlock(v => block.data.sensorId = v)" />
        </q-field>
      </q-card-main>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

