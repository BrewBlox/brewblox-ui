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

    <q-card-section
      class="row q-mx-md q-gutter-y-sm justify-between"
    >
      <UnitField
        :class="{darkened: !block.data.settingEnabled}"
        :value="block.data.storedSetting"
        :readonly="isDriven"
        title="Setting"
        label="Setting"
        tag="big"
        class="col-auto"
        @input="v => {block.data.storedSetting = v; saveBlock()}"
      />
      <UnitField
        :value="block.data.value"
        label="Sensor"
        tag="big"
        readonly
        class="col-auto"
      />
      <UnitField
        :value="block.data.valueUnfiltered"
        label="Unfiltered sensor"
        tag="big"
        class="col-auto"
        readonly
      />
      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-12"
      />
    </q-card-section>
  </div>
</template>
