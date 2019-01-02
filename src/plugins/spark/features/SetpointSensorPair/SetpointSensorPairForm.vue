<script lang="ts">
import { Unit } from '@/helpers/units';
import { SetpointLink, TempSensorLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class SetpointSensorPairForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          setpointId: new SetpointLink(null),
          sensorId: new TempSensorLink(null),
          setpointValue: new Unit(0, 'degC'),
          sensorValue: new Unit(0, 'degC'),
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-btn
      v-close-overlay
      v-if="$props.buttons"
      rounded
      label="close"
      icon="close"
      style="position: absolute; right: 18px; top: 18px"
    />
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Setpoint">
          <LinkPopupEdit
            :field="block.data.setpointId"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.data.setpointId = v)"
            label="Setpoint"
          />
        </q-field>
        <q-field class="col" label="Sensor">
          <LinkPopupEdit
            :field="block.data.sensorId"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.data.sensorId = v)"
            label="Sensor"
          />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Block Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Block ID">
          <InputPopupEdit :field="block.id" :change="changeBlockId" label="Block ID"/>
        </q-field>
        <q-field class="col" label="Service ID">
          <big>{{ serviceId }}</big>
        </q-field>
        <q-field class="col" label="Block Type">
          <big>{{ block.type }}</big>
        </q-field>
        <q-field class="col" label="Profiles">
          <ProfilesPopupEdit
            :field="block.profiles"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
          />
        </q-field>
        <q-field class="col" label="Preset">
          <SelectPopupEdit
            :field="block.data"
            :options="presets()"
            :change="callAndSaveBlock(v => block.data = v)"
            label="Preset"
          />
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

