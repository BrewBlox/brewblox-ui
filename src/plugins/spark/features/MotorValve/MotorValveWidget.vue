<script lang="ts">
import { Component } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';
import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { MotorValveBlock, ValveState } from './types';

@Component
export default class MotorValveWidget extends BlockWidget {
  readonly block!: MotorValveBlock;

  get valveStateName() {
    return spaceCased(ValveState[this.block.data.valveState]);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <template v-if="!block.data.hwDevice.id || !block.data.startChannel">
        <q-item dark>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>No pin selected</q-item-section>
        </q-item>
      </template>

      <template v-else>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>State</q-item-label>
            <ActuatorField
              :value="block.data.state"
              :disable="isDriven"
              @input="v => { block.data.state = v; saveBlock(); }"
            />
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Valve State</q-item-label>
            {{ valveStateName }}
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <DigitalConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly/>
          </q-item-section>
        </q-item>
      </template>
    </q-card-section>
  </q-card>
</template>
