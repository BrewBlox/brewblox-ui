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
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <UnitField
        :class="{darkened: !block.data.settingEnabled}"
        :value="block.data.storedSetting"
        :readonly="isDriven"
        title="Setting"
        label="Setting"
        tag="big"
        class="col-grow"
        @input="v => {block.data.storedSetting = v; saveBlock()}"
      />
      <UnitField
        :value="block.data.value"
        label="Sensor"
        tag="big"
        readonly
        class="col-grow"
      />
      <UnitField
        :value="block.data.valueUnfiltered"
        label="Unfiltered sensor"
        tag="big"
        class="col-grow"
        readonly
      />

      <div class="col-break" />

      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>
  </div>
</template>
