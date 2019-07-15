<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { ActuatorAnalogMockBlock } from './types';

@Component
export default class ActuatorAnalogMockWidget extends BlockWidget {
  readonly block!: ActuatorAnalogMockBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <q-card-section>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Setting</q-item-label>
          <div :style="block.data.setting === block.data.desiredSetting ? '' : 'color: orange'">
            <SliderField
              :value="block.data.setting"
              :readonly="isDriven"
              style="display: inline-block"
              title="Analog actuator Setting"
              tag="big"
              @input="v => { block.data.desiredSetting = v; saveBlock(); }"
            />
          </div>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Value</q-item-label>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
        <q-item-section>
          <AnalogConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
