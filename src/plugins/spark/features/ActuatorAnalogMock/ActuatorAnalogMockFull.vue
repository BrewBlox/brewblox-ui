<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorAnalogMockBlock } from '@/plugins/spark/types';

export default defineComponent({
  name: 'ActuatorAnalogMockFull',
  setup() {
    const {
      serviceId,
      block,
      saveBlock,
      isDriven,
    } = useBlockWidget.setup<ActuatorAnalogMockBlock>();

    return {
      serviceId,
      block,
      saveBlock,
      isDriven,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <InputField
        :readonly="isDriven"
        :model-value="block.data.setting"
        label="Setting"
        type="number"
        title="Target"
        tag="big"
        class="col-grow"
        @update:model-value="v => { block.data.desiredSetting = v; saveBlock(); }"
      />
      <InputField
        :model-value="block.data.minSetting"
        title="Setting min"
        label="Clip to min"
        type="number"
        tag="big"
        class="col-grow"
        @update:model-value="v => { block.data.minSetting = v; saveBlock(); }"
      />
      <InputField
        :model-value="block.data.maxSetting"
        type="number"
        title="Setting max"
        label="Clip to max"
        tag="big"
        class="col-grow"
        @update:model-value="v => { block.data.maxSetting = v; saveBlock(); }"
      />
      <div class="col-break" />
      <LabeledField
        :model-value="block.data.value"
        type="number"
        label="Value"
        tag="big"
        class="col-grow"
      />
      <InputField
        :model-value="block.data.minValue"
        type="number"
        title="Value min"
        label="Clip to min"
        tag="big"
        class="col-grow"
        @update:model-value="v => { block.data.minValue = v; saveBlock(); }"
      />
      <InputField
        :model-value="block.data.maxValue"
        type="number"
        title="Value max"
        label="Clip to max"
        tag="big"
        class="col-grow"
        @update:model-value="v => { block.data.maxValue = v; saveBlock(); }"
      />
      <div class="col-break" />
      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
      <ConstraintsField
        :model-value="block.data.constrainedBy"
        :service-id="serviceId"
        type="analog"
        class="col-grow"
        @update:model-value="v => { block.data.constrainedBy = v; saveBlock(); }"
      />
    </div>
  </div>
</template>
