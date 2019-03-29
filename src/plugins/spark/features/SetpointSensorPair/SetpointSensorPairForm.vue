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
  <q-card dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <div class="column">
              <span>Setpoint</span>
              <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
            </div>
          </q-item-section>
          <q-item-section>
            <LinkPopupEdit
              :field="block.data.setpointId"
              :service-id="serviceId"
              :change="callAndSaveBlock(v => block.data.setpointId = v)"
              label="Setpoint"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Sensor</q-item-section>
          <q-item-section>
            <LinkPopupEdit
              :field="block.data.sensorId"
              :service-id="serviceId"
              :change="callAndSaveBlock(v => block.data.sensorId = v)"
              label="Sensor"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
