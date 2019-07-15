<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DigitalActuatorBlock } from './types';

@Component
export default class DigitalActuatorWidget extends BlockWidget {
  readonly block!: DigitalActuatorBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />

    <CardWarning v-if="!block.data.hwDevice.id || !block.data.channel">
      <template #message>
        <span>No channel selected</span>
      </template>
    </CardWarning>
    <q-card-section v-else>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>State</q-item-label>
          <DigitalStateField
            :value="block.data.desiredState"
            :pending="block.data.state !== block.data.desiredState"
            :pending-reason="constrainers"
            :disable="isDriven"
            @input="v => { block.data.desiredState = v; saveBlock(); }"
          />
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <DigitalConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
