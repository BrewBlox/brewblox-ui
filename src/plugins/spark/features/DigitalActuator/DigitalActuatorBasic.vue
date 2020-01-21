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
  <div>
    <slot name="warnings">
      <q-card-section>
        <DigitalStateField
          :value="block.data.desiredState"
          :pending="block.data.state !== block.data.desiredState"
          :pending-reason="constrainers"
          :disable="isDriven"
          dense
          label="State"
          item-aligned
          @input="v => { block.data.desiredState = v; saveBlock(); }"
        />
        <q-item>
          <q-item-section>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
            <ConstraintsField
              :value="block.data.constrainedBy"
              :service-id="serviceId"
              type="digital"
              @input="v => { block.data.constrainedBy = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-card-section>
    </slot>
  </div>
</template>
