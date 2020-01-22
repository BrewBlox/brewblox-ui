<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorOffsetBlock } from '@/plugins/spark/features/ActuatorOffset/types';

@Component
export default class ActuatorOffsetFull
  extends BlockCrudComponent<ActuatorOffsetBlock> {
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings">
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
        :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
      />
    </slot>

    <div class="widget-body row">
      <InputField
        :readonly="isDriven"
        :value="block.data.desiredSetting"
        tag="big"
        title="Target offset"
        label="Target Offset"
        type="number"
        class="col-grow"
        @input="v => { block.data.desiredSetting = v; saveBlock(); }"
      />
      <LabeledField
        :value="block.data.value"
        number
        label="Current Offset"
        tag="big"
        class="col-grow"
      />

      <div class="col-break" />

      <BlockField
        :value="block.data.targetId"
        :service-id="serviceId"
        title="Driven Block"
        label="Driven Block"
        class="col-grow"
        @input="v => { block.data.targetId = v; saveBlock(); }"
      />
      <BlockField
        :value="block.data.referenceId"
        :service-id="serviceId"
        title="Reference block"
        label="Reference Block"
        class="col-grow"
        @input="v => { block.data.referenceId = v; saveBlock(); }"
      />
      <SelectField
        :value="block.data.referenceSettingOrValue"
        :options="[{label: 'Setting', value: 0}, {label: 'Measured', value: 1}]"
        title="Reference field"
        label="Reference Field"
        class="col-grow"
        @input="v => { block.data.referenceSettingOrValue = v; saveBlock(); }"
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
