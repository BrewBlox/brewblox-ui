<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { ActuatorAnalogMockBlock } from './types';

@Component
export default class ActuatorAnalogMockWidget extends BlockWidget {
  readonly block!: ActuatorAnalogMockBlock;

  get renamedTargets() {
    return {
      setting: 'Setting',
      value: 'Value',
    };
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorAnalogMockForm
        v-if="modalOpen"
        v-bind="$props"
        :block="block"
        @update:block="saveBlock"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="block.value === null" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>This Actuator is invalid</q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Setting</q-item-label>
          <InputField
            :value="block.data.setting"
            :readonly="isDriven"
            title="Setting"
            tag="big"
            type="number"
            @input="v => { block.data.setting = v; saveBlock(); }"
          />
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Value</q-item-label>
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
