<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorAnalogMockBlock } from '@/plugins/spark/types';

@Component
export default class ActuatorAnalogMockBasic
  extends BlockCrudComponent<ActuatorAnalogMockBlock> {
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <SliderField
        :value="block.data.setting"
        :readonly="isDriven"
        title="Analog actuator Setting"
        label="Setting"
        tag="big"
        class="col-grow"
        :tag-class="{'text-orange': block.data.setting !== block.data.desiredSetting}"
        @input="v => { block.data.desiredSetting = v; saveBlock(); }"
      />
      <LabeledField
        :value="block.data.value"
        label="Value"
        type="number"
        tag="big"
        class="col-grow"
      />
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
