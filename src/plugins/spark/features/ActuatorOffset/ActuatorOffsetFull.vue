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
  <div>
    <slot name="warnings">
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
        :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
      />
    </slot>

    <q-card-section>
      <BlockField
        :value="block.data.targetId"
        :service-id="serviceId"
        title="Driven Block"
        label="Driven Block"
        item-aligned
        @input="v => { block.data.targetId = v; saveBlock(); }"
      />
      <q-item>
        <q-item-section>
          <BlockField
            :value="block.data.referenceId"
            :service-id="serviceId"
            title="Reference block"
            label="Reference Block"
            @input="v => { block.data.referenceId = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <SelectField
            :value="block.data.referenceSettingOrValue"
            :options="[{label: 'Setting', value: 0}, {label: 'Measured', value: 1}]"
            title="Reference field"
            label="Reference Field"
            @input="v => { block.data.referenceSettingOrValue = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <InputField
            :readonly="isDriven"
            :value="block.data.desiredSetting"
            tag="big"
            title="Target offset"
            label="Target Offset"
            type="number"
            @input="v => { block.data.desiredSetting = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <LabeledField :value="block.data.value" number label="Current Offset" tag="big" />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
          <ConstraintsField
            :value="block.data.constrainedBy"
            :service-id="serviceId"
            type="analog"
            @input="v => { block.data.constrainedBy = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </div>
</template>
