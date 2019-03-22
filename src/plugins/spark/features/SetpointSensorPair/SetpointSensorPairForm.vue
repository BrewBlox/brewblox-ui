<script lang="ts">
import { Unit } from '@/helpers/units';
import { SetpointLink, TempSensorLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class SetpointSensorPairForm extends BlockForm {
  defaultData() {
    return {
      setpointId: new SetpointLink(null),
      sensorId: new TempSensorLink(null),
      setpointValue: new Unit(null, 'degC'),
      sensorValue: new Unit(null, 'degC'),
    };
  }

  presets() {
    return [];
  }
}
</script>

<template>
  <div class="widget-modal column">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>
    <q-expansion-item class="text-h6" opened group="modal" icon="settings" label="Settings">
      <div>
        <q-field label="Setpoint">
          <LinkPopupEdit
            :field="block.data.setpointId"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.data.setpointId = v)"
            label="Setpoint"
          />
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-field>
        <q-field label="Sensor">
          <LinkPopupEdit
            :field="block.data.sensorId"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.data.sensorId = v)"
            label="Sensor"
          />
        </q-field>
      </div>
    </q-expansion-item>

    <q-expansion-item class="text-h6" group="modal" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-expansion-item>
  </div>
</template>
