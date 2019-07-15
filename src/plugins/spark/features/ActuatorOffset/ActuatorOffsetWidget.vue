<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { ActuatorOffsetBlock } from './types';

@Component
export default class ActuatorOffsetWidget extends BlockWidget {
  readonly block!: ActuatorOffsetBlock;

  get warnings() {
    const warn: string[] = [];
    if (!this.block.data.targetId === null) {
      warn.push('Driven process value invalid');
    }
    if (this.block.data.referenceId === null) {
      warn.push('Reference process value');
    }
    return warn.join(', ');
  }

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <CardWarning v-if="!block.data.targetId.id">
      <template #message>Target setpoint is not configured for this setpoint driver.</template>
    </CardWarning>
    <CardWarning v-else-if="!block.data.referenceId.id">
      <template #message>Reference setpoint is not configured for this setpoint driver.</template>
    </CardWarning>
    <CardWarning v-else-if="!block.data.enabled">
      <template #message>
        <span>
          This setpoint driver is disabled:
          <i>{{ block.data.targetId }}</i> will not be changed.
        </span>
      </template>
      <template #actions>
        <q-btn text-color="white" flat label="Enable" @click="enable" />
      </template>
    </CardWarning>
    <q-card-section>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Target offset</q-item-label>
          <big>{{ block.data.desiredSetting | round }}</big>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Actual offset</q-item-label>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <AnalogConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
