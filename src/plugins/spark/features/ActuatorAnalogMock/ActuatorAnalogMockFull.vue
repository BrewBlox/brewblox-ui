<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorAnalogMockBlock } from '@/plugins/spark/types';

@Component
export default class ActuatorAnalogMockFull
  extends BlockCrudComponent<ActuatorAnalogMockBlock> {
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <InputField
        :readonly="isDriven"
        :value="block.data.setting"
        label="Setting"
        type="number"
        title="Target"
        tag="big"
        class="col-grow"
        @input="v => { block.data.desiredSetting = v; saveBlock(); }"
      />
      <InputField
        :value="block.data.minSetting"
        title="Setting min"
        label="Clip to min"
        type="number"
        tag="big"
        class="col-grow"
        @input="v => { block.data.minSetting = v; saveBlock(); }"
      />
      <InputField
        :value="block.data.maxSetting"
        type="number"
        title="Setting max"
        label="Clip to max"
        tag="big"
        class="col-grow"
        @input="v => { block.data.maxSetting = v; saveBlock(); }"
      />
      <div class="col-break" />
      <LabeledField
        :value="block.data.value"
        type="number"
        label="Value"
        tag="big"
        class="col-grow"
      />
      <InputField
        :value="block.data.minValue"
        type="number"
        title="Value min"
        label="Clip to min"
        tag="big"
        class="col-grow"
        @input="v => { block.data.minValue = v; saveBlock(); }"
      />
      <InputField
        :value="block.data.maxValue"
        type="number"
        title="Value max"
        label="Clip to max"
        tag="big"
        class="col-grow"
        @input="v => { block.data.maxValue = v; saveBlock(); }"
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
