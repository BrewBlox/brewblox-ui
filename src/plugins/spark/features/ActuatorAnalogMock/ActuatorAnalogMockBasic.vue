<script setup lang="ts">
import { ActuatorAnalogMockBlock } from 'brewblox-proto/ts';
import { useBlockWidget } from '@/plugins/spark/composables';

const { serviceId, block, isClaimed, patchBlock } =
  useBlockWidget.setup<ActuatorAnalogMockBlock>();
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <SliderField
        :model-value="block.data.storedSetting"
        :readonly="isClaimed"
        title="Analog actuator Setting"
        label="Setting"
        tag="big"
        class="col-grow"
        :tag-class="{
          'text-orange': block.data.desiredSetting !== block.data.storedSetting,
        }"
        @update:model-value="(v) => patchBlock({ storedSetting: v })"
      />
      <LabeledField
        :model-value="block.data.value"
        label="Value"
        type="number"
        tag="big"
        class="col-grow"
      />

      <div class="col-break" />

      <ClaimIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
      <AnalogConstraintsField
        :model-value="block.data.constraints || {}"
        :service-id="serviceId"
        class="col-grow"
      />
    </div>
  </div>
</template>
