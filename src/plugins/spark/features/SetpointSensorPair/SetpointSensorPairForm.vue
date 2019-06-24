<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairForm extends BlockCrudComponent {
  readonly block!: SetpointSensorPairBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar :title="widget.title"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section class="col-3" style="justify-content: flex-start">
            <q-item-label caption>Setting</q-item-label>
            <UnitField
              :value="block.data.storedSetting"
              :readonly="isDriven"
              :class="{darkened: !block.data.settingEnabled}"
              title="Setting"
              tag="big"
              @input="v => { block.data.storedSetting = v; saveBlock(); }"
            />
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
            <LinkField
              :value="block.data.sensorId"
              :service-id="serviceId"
              title="Sensor"
              tag="big"
              @input="v => { block.data.sensorId = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
