<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairForm extends BlockForm {
  readonly block!: SetpointSensorPairBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

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
    </q-card-section>
  </q-card>
</template>
