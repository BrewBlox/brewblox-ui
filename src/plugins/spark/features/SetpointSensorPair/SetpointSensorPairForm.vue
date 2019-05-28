<script lang="ts">
import Component from 'vue-class-component';

import { Unit } from '@/helpers/units';
import { TempSensorLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';

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
          <q-item-section class="col-3" style="justify-content: flex-start">
            <q-item-label caption>Setting</q-item-label>
            <UnitPopupEdit
              v-if="!isDriven"
              :field="block.data.storedSetting"
              :change="callAndSaveBlock(v => block.data.storedSetting = v)"
              :class="{darkened: !block.data.settingEnabled}"
              label="Setting"
            />
            <UnitField v-else :field="block.data.storedSetting"/>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
          <q-item-section class="col-3" style="justify-content: flex-start">
            <q-item-label caption>Enabled</q-item-label>
            <q-toggle
              :value="block.data.settingEnabled"
              :disable="isDriven"
              @input="v => { block.data.settingEnabled = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section class="col-6" style="justify-content: flex-start">
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
