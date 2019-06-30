<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import sparkStore from '@/plugins/spark/store';

import { Block } from '../../types';
import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairForm extends BlockCrudComponent {
  readonly block!: SetpointSensorPairBlock;

  get usedBy(): Block[] {
    if (!this.isStoreBlock) {
      return [];
    }
    return sparkStore.blockValues(this.serviceId)
      .filter(block => get(block, 'data.inputId.id') === this.blockId);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud"/>

    <q-card-section>
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
      <q-item v-if="usedBy.length" dark>
        <q-item-section>
          <q-item-label caption>This setpoint is used by:</q-item-label>
          <div class="row">
            <q-btn
              v-for="block in usedBy"
              :key="block.id"
              :label="block.id"
              flat
              no-caps
              @click="showOtherBlock(block)"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item v-else dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>This setpoint is not used by any PID</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
