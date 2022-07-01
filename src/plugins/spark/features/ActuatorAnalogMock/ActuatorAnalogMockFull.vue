<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorAnalogMockBlock } from '@/plugins/spark/types';

export default defineComponent({
  name: 'ActuatorAnalogMockFull',
  setup() {
    const { serviceId, block, patchBlock, isDriven } =
      useBlockWidget.setup<ActuatorAnalogMockBlock>();

    return {
      serviceId,
      block,
      patchBlock,
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
        :model-value="block.data.desiredSetting"
        label="Setting"
        type="number"
        title="Target"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ desiredSetting: v })"
      />
      <InputField
        :model-value="block.data.minSetting"
        title="Setting min"
        label="Clip to min"
        type="number"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ minSetting: v })"
      />
      <InputField
        :model-value="block.data.maxSetting"
        type="number"
        title="Setting max"
        label="Clip to max"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ maxSetting: v })"
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
        @update:model-value="(v) => patchBlock({ minValue: v })"
      />
      <InputField
        :model-value="block.data.maxValue"
        type="number"
        title="Value max"
        label="Clip to max"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ maxValue: v })"
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
        @update:model-value="(v) => patchBlock({ constrainedBy: v })"
      />
    </div>
  </div>
</template>
