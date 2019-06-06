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

  get renamedTargets() {
    return {
      setting: 'Target offset',
      value: 'Actual offset',
    };
  }

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorOffsetForm
        v-if="modalOpen"
        v-bind="$props"
        :block="block"
        @update:block="saveBlock"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="!block.data.enabled" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>
          <span>
            Offset is disabled:
            <i>{{ block.data.targetId }}</i> will not be changed.
          </span>
        </q-item-section>
        <q-item-section side>
          <q-btn text-color="white" flat label="Enable" @click="enable"/>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Target offset</q-item-label>
          <big>{{ block.data.setting | round }}</big>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Actual offset</q-item-label>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <AnalogConstraints
            :service-id="serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            readonly
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
