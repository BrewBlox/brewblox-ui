<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorAnalogMockBlock } from './types';

@Component
export default class ActuatorAnalogMockForm extends BlockCrudComponent {
  readonly block!: ActuatorAnalogMockBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Setting</q-item-label>
            <InputField
              :readonly="isDriven"
              :value="block.data.desiredSetting"
              type="number"
              title="Target"
              tag="big"
              @input="v => { block.data.desiredSetting = v; saveBlock(); }"
            />
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Clip to min</q-item-label>
            <InputField
              :value="block.data.minSetting"
              title="Setting min"
              type="number"
              tag="big"
              @input="v => { block.data.minSetting = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Clip to max</q-item-label>
            <InputField
              :value="block.data.maxSetting"
              type="number"
              title="Setting max"
              tag="big"
              @input="v => { block.data.maxSetting = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Value</q-item-label>
            <big>{{ block.data.value | round }}</big>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Clip to min</q-item-label>
            <InputField
              :value="block.data.minValue"
              type="number"
              title="Value min"
              tag="big"
              @input="v => { block.data.minValue = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Clip to max</q-item-label>
            <InputField
              :value="block.data.maxValue"
              type="number"
              title="Value max"
              tag="big"
              @input="v => { block.data.maxValue = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-less-than-or-equal" label="Constraints">
        <AnalogConstraints
          :value="block.data.constrainedBy"
          :service-id="serviceId"
          @input="v => { block.data.constrainedBy = v; saveBlock(); }"
        />
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
