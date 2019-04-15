<script lang="ts">
import { Unit } from '@/helpers/units';
import { TempSensorLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class SetpointSensorPairForm extends BlockForm {
  defaultData() {
    return {
      sensorId: new TempSensorLink(null),
      setting: new Unit(null, 'degC'),
      value: new Unit(null, 'degC'),
      settingEnabled: true,
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
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Setting</q-item-label>
            <UnitPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :service-id="serviceId"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              label="Setting"
            />
            <UnitField v-else :field="block.data.setting"/>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Sensor</q-item-label>
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
