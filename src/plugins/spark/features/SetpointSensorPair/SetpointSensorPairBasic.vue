<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '../../components/BlockCrudComponent';
import { sparkStore } from '../../store';
import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairBasic extends BlockCrudComponent {
  readonly block!: SetpointSensorPairBlock;

  get isUsed(): boolean {
    return sparkStore.blockValues(this.serviceId)
      .some(block => get(block, 'data.inputId.id') === this.blockId);
  }
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

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
