<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DigitalActuatorBlock } from './types';

@Component
export default class DigitalActuatorBasic extends BlockCrudComponent {
  readonly block!: DigitalActuatorBlock;
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings">
      <q-card-section>
        <q-item>
          <q-item-section>
            <ValueField label="State" dense>
              <DigitalStateField
                :value="block.data.desiredState"
                :pending="block.data.state !== block.data.desiredState"
                :pending-reason="constrainers"
                :disable="isDriven"
                @input="v => { block.data.desiredState = v; saveBlock(); }"
              />
            </ValueField>
          </q-item-section>
        </q-item>
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
  </q-card>
</template>
