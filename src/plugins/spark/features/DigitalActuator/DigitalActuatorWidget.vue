<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { DigitalActuatorBlock } from './types';

@Component
export default class DigitalActuatorWidget extends BlockWidgetBase {
  readonly block!: DigitalActuatorBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />

    <CardWarning v-if="!block.data.hwDevice.id || !block.data.channel">
      <template #message>
        <span>Digital Actuator has no channel selected.</span>
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
