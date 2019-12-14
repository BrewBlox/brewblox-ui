<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { SetpointSensorPairBlock } from './types';

@Component
export default class SetpointSensorPairBasic
  extends BlockCrudComponent<SetpointSensorPairBlock> {
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item>
        <q-item-section>
          <UnitField
            :class="{darkened: !block.data.settingEnabled}"
            :value="block.data.storedSetting"
            :readonly="isDriven"
            title="Setting"
            label="Setting"
            tag="big"
            class="self-start"
            @input="v => {block.data.storedSetting = v; saveBlock()}"
          />
        </q-item-section>
        <q-item-section>
          <UnitField :value="block.data.value" label="Sensor" tag="big" readonly />
        </q-item-section>
        <q-item-section>
          <UnitField
            :value="block.data.valueUnfiltered"
            label="Unfiltered sensor"
            tag="big"
            readonly
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
