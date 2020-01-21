<script lang="ts">
import { Component } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { MotorValveBlock, ValveState } from './types';

@Component
export default class MotorValveBasic
  extends BlockCrudComponent<MotorValveBlock> {

  get valveStateName(): string {
    return spaceCased(ValveState[this.block.data.valveState]);
  }
}
</script>

<template>
  <div>
    <slot name="warnings">
      <q-card-section>
        <q-item class="items-start">
          <q-item-section>
            <DigitalStateField
              :value="block.data.desiredState"
              :pending="block.data.state !== block.data.desiredState"
              :pending-reason="constrainers"
              :disable="isDriven"
              label="State"
              @input="v => { block.data.desiredState = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section>
            <LabeledField :value="valveStateName" label="Valve State" />
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
  </div>
</template>
