<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorAnalogMockBlock } from '@/plugins/spark/types';

export default defineComponent({
  name: 'ActuatorAnalogMockBasic',
  setup() {
    const { serviceId, block, isDriven, saveBlock } =
      useBlockWidget.setup<ActuatorAnalogMockBlock>();

    return {
      serviceId,
      block,
      isDriven,
      saveBlock,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <SliderField
        :model-value="block.data.setting"
        :readonly="isDriven"
        title="Analog actuator Setting"
        label="Setting"
        tag="big"
        class="col-grow"
        :tag-class="{
          'text-orange': block.data.setting !== block.data.desiredSetting,
        }"
        @update:model-value="
          (v) => {
            block.data.desiredSetting = v;
            saveBlock();
          }
        "
      />
      <LabeledField
        :model-value="block.data.value"
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
        :model-value="block.data.constrainedBy"
        :service-id="serviceId"
        type="analog"
        class="col-grow"
        @update:model-value="
          (v) => {
            block.data.constrainedBy = v;
            saveBlock();
          }
        "
      />
    </div>
  </div>
</template>
