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
    <q-toolbar v-if="!$props.embedded" class="unpadded">
      <q-toolbar-title>{{ widgetId }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible opened group="modal" class="col-12" icon="settings" label="Settings">
      <div>
        <q-field label="Setpoint">
          <LinkPopupEdit
            :field="block.data.setpointId"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.data.setpointId = v)"
            label="Setpoint"
          />
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
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="view_compact" label="Widget Settings">
      <WidgetSettings v-bind="$props"/>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>
