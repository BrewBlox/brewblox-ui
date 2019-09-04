<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { sparkStore } from '../../store';
import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairWidget extends BlockWidget {
  readonly block!: SetpointSensorPairBlock;

  get isUsed(): boolean {
    return sparkStore.blockValues(this.serviceId)
      .some(block => get(block, 'data.inputId.id') === this.blockId);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />

    <CardWarning v-if="!isUsed">
      <template #message>
        This Setpoint is not used as PID input.
      </template>
    </CardWarning>
    <CardWarning v-else-if="!block.data.settingEnabled">
      <template #message>
        <span>This setpoint is disabled.</span>
      </template>
      <template #actions>
        <q-btn
          text-color="white"
          flat
          label="Enable"
          @click="block.data.settingEnabled = true; saveBlock();"
        />
      </template>
    </CardWarning>

    <q-card-section>
      <q-item dark>
        <q-item-section class="q-mr-md">
          <q-item-label caption>
            Setting
          </q-item-label>
          <UnitField
            :class="{darkened: !block.data.settingEnabled}"
            :value="block.data.storedSetting"
            :readonly="isDriven"
            title="Setting"
            tag="big"
            @input="v => {block.data.storedSetting = v; saveBlock()}"
          />
        </q-item-section>
        <q-item-section class="q-mr-md">
          <q-item-label caption>
            Sensor
          </q-item-label>
          <UnitField :value="block.data.value" tag="big" readonly />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-item-label caption>
            Unfiltered sensor
          </q-item-label>
          <UnitField :value="block.data.valueUnfiltered" tag="big" readonly />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
