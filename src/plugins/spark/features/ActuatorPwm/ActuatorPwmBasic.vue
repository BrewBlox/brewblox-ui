<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorPwmBlock } from './types';

@Component
export default class ActuatorPwmBasic
  extends BlockCrudComponent<ActuatorPwmBlock> {

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
        :value="block.data.setting"
        :readonly="isDriven"
        :tag-class="{['text-orange']: isConstrained}"
        title="Duty Setting"
        label="Setting"
        suffix="%"
        tag="big"
        class="col-grow"
        @input="v => { block.data.desiredSetting = v; saveBlock(); }"
      />
      <LabeledField
        :value="block.data.value"
        label="Duty achieved"
        number
        suffix="%"
        tag="big"
        class="col-grow"
      />
      <LabeledField
        v-if="isConstrained"
        label="Unconstrained setting"
        :value="block.data.desiredSetting"
        number
        suffix="%"
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
        :value="block.data.constrainedBy"
        :service-id="serviceId"
        type="analog"
        class="col-grow"
        @input="v => { block.data.constrainedBy = v; saveBlock(); }"
      />
    </div>
  </div>
</template>
