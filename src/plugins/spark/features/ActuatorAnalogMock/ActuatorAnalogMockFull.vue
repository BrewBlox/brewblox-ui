<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorAnalogMockBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActuatorAnalogMockFull',
  setup() {
    const { serviceId, block, patchBlock, isClaimed } =
      useBlockWidget.setup<ActuatorAnalogMockBlock>();

    return {
      serviceId,
      block,
      patchBlock,
      isClaimed,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <InputField
        :readonly="isClaimed"
        :model-value="block.data.storedSetting"
        label="Setting"
        type="number"
        title="Target"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ storedSetting: v })"
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
      <ClaimIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
      <AnalogConstraintsField
        :model-value="block.data.constraints"
        :service-id="serviceId"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ constraints: v })"
      />
    </div>
  </div>
</template>
