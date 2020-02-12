<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DigitalActuatorBlock } from './types';

@Component
export default class DigitalActuatorBasic
  extends BlockCrudComponent<DigitalActuatorBlock> {
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings">
      <div class="widget-body row">
        <LabeledField
          class="col"
          tag-class="full-width row justify-center"
        >
          <DigitalStateButton
            :value="block.data.desiredState"
            :pending="block.data.state !== block.data.desiredState"
            :pending-reason="constrainers"
            :disable="isDriven"
            dense
            class="col-auto"
            @input="v => { block.data.desiredState = v; saveBlock(); }"
          />
        </LabeledField>

        <div class="col-break" />

        <DrivenIndicator
          :block-id="block.id"
          :service-id="serviceId"
          class="col-grow"
        />
        <ConstraintsField
          :value="block.data.constrainedBy"
          :service-id="serviceId"
          type="digital"
          class="col-grow"
          @input="v => { block.data.constrainedBy = v; saveBlock(); }"
        />
      </div>
    </slot>
  </div>
</template>
