<script lang="ts">
import { Component } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';
import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { sparkStore } from '../../store';
import { typeName as spark3PinType } from '../Spark3Pins/getters';
import { Spark3PinsBlock } from '../Spark3Pins/types';
import { MotorValveBlock, ValveState } from './types';

@Component
export default class MotorValveWidget extends BlockWidget {
  readonly block!: MotorValveBlock;

  get valveStateName(): string {
    return spaceCased(ValveState[this.block.data.valveState]);
  }

  get pins(): Spark3PinsBlock | null {
    const block = sparkStore.blockValues(this.serviceId)
      .find(block => block.type === spark3PinType);
    return block ? block as Spark3PinsBlock : null;
  }

  get disabled12V(): boolean {
    return !!this.pins && !this.pins.data.enableIoSupply12V;
  }

  enable12V(): void {
    if (this.pins) {
      this.pins.data.enableIoSupply12V = true;
      sparkStore.saveBlock([this.serviceId, this.pins]);
    }
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <CardWarning v-if="disabled12V">
      <template #message>
        <span>12V is disabled.</span>
      </template>
      <template #actions>
        <q-btn text-color="white" flat label="Enable 12V" @click="enable12V" />
      </template>
    </CardWarning>
    <CardWarning v-if="!block.data.hwDevice.id || !block.data.startChannel">
      <template #message>
        <span>This Motor Valve has no channel selected.</span>
      </template>
    </CardWarning>
    <q-card-section v-else>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            State
          </q-item-label>
          <DigitalStateField
            :value="block.data.desiredState"
            :pending="block.data.state !== block.data.desiredState"
            :pending-reason="constrainers"
            :disable="isDriven"
            @input="v => { block.data.desiredState = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Valve State
          </q-item-label>
          {{ valveStateName }}
        </q-item-section>
      </q-item>
      <q-item dark>
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
  </q-card>
</template>
