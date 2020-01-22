<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorOffsetBlock } from './types';

@Component
export default class ActuatorOffsetBasic
  extends BlockCrudComponent<ActuatorOffsetBlock> {
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <LabeledField
        label="Target offset"
        tag="big"
        class="col-grow"
      >
        {{ block.data.desiredSetting | round }}
      </LabeledField>
      <LabeledField
        label="Actual offset"
        tag="big"
        class="col-grow"
      >
        {{ block.data.value | round }}
      </LabeledField>
      <div class="col-break" />
      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
      <ConstraintsField
        :value="block.data.constrainedBy"
        :service-id="serviceId"
        type="analog"
        class="col-grow"
        @input="v => { block.data.constrainedBy = v; saveBlock(); }"
      />
    </div>
  </div>
</template>
