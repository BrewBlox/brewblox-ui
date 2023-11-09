<script setup lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { ActuatorAnalogMockBlock } from 'brewblox-proto/ts';

const { serviceId, block, patchBlock, isClaimed } =
  useBlockWidget.setup<ActuatorAnalogMockBlock>();
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <NumberField
        :readonly="isClaimed"
        :model-value="block.data.storedSetting"
        label="Setting"
        title="Target"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ storedSetting: v })"
      />
      <NumberField
        :model-value="block.data.minSetting"
        title="Setting min"
        label="Clip to min"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ minSetting: v })"
      />
      <NumberField
        :model-value="block.data.maxSetting"
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
      <NumberField
        :model-value="block.data.minValue"
        title="Value min"
        label="Clip to min"
        tag="big"
        class="col-grow"
        @update:model-value="(v) => patchBlock({ minValue: v })"
      />
      <NumberField
        :model-value="block.data.maxValue"
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
        :service-id="serviceId"
        :model-value="block.data.constraints"
        class="col-grow"
      />

      <div class="col-break" />

      <AnalogConstraintsEditor
        :service-id="serviceId"
        :model-value="block.data.constraints"
        @update:model-value="(v) => patchBlock({ constraints: v })"
      />
    </div>
  </div>
</template>
