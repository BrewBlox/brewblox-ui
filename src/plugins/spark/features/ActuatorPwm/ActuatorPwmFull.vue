<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorPwmBlock } from '@/plugins/spark/types';

@Component
export default class ActuatorPwmFull
  extends BlockCrudComponent<ActuatorPwmBlock> {

  quickValues = [
    { label: '0%', value: 0 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: '100%', value: 100 },
  ]

  get isConstrained(): boolean {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <SliderField
        :value="block.data.desiredSetting"
        :readonly="isDriven"
        :quick-actions="quickValues"
        label="Duty setting"
        tag="big"
        :tag-class="{['text-orange']: isConstrained}"
        title="Setting"
        class="col-grow"
        @input="v => { block.data.desiredSetting = v; saveBlock(); }"
      />
      <LabeledField
        :value="block.data.value"
        number
        label="Duty achieved"
        tag="big"
        suffix="%"
        class="col-grow"
      />
      <LabeledField
        v-if="isConstrained"
        label="Constrained setting"
        :value="block.data.setting"
        number
        tag="big"
        suffix="%"
        class="col-grow"
      />

      <div class="col-break" />

      <DurationField
        :value="block.data.period"
        title="Period"
        label="Period"
        tag="big"
        class="col-grow"
        @input="v => { block.data.period = v; saveBlock(); }"
      />
      <LinkField
        :value="block.data.actuatorId"
        :service-id="serviceId"
        title="target"
        label="Digital Actuator Target"
        class="col-grow"
        @input="v => { block.data.actuatorId = v; saveBlock(); }"
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
