<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { MotorValveBlock } from '@/plugins/spark/types';

export default defineComponent({
  name: 'MotorValveBasic',
  setup() {
    const { serviceId, block, saveBlock, limitations, isDriven } =
      useBlockWidget.setup<MotorValveBlock>();

    return {
      serviceId,
      block,
      saveBlock,
      limitations,
      isDriven,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings">
      <div class="widget-body row">
        <LabeledField
          label="State"
          class="col-grow"
        >
          <DigitalStateButton
            :model-value="block.data.desiredState"
            :pending="block.data.state !== block.data.desiredState"
            :pending-reason="limitations"
            :disable="isDriven"
            @update:model-value="
              (v) => {
                block.data.desiredState = v;
                saveBlock();
              }
            "
          />
        </LabeledField>
        <LabeledField
          :model-value="block.data.valveState"
          label="Valve State"
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
          type="digital"
          class="col-grow"
          @update:model-value="
            (v) => {
              block.data.constrainedBy = v;
              saveBlock();
            }
          "
        />
      </div>
    </slot>
  </div>
</template>
