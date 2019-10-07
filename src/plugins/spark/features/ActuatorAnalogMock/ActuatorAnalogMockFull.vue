<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorAnalogMockBlock } from './types';

@Component
export default class ActuatorAnalogMockFull extends BlockCrudComponent {
  readonly block!: ActuatorAnalogMockBlock;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>
            Setting
          </q-item-label>
          <InputField
            :readonly="isDriven"
            :value="block.data.setting"
            type="number"
            title="Target"
            tag="big"
            @input="v => { block.data.desiredSetting = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>
            Clip to min
          </q-item-label>
          <InputField
            :value="block.data.minSetting"
            title="Setting min"
            type="number"
            tag="big"
            @input="v => { block.data.minSetting = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>
            Clip to max
          </q-item-label>
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
          <q-item-label caption>
            Value
          </q-item-label>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Clip to min
          </q-item-label>
          <InputField
            :value="block.data.minValue"
            type="number"
            title="Value min"
            tag="big"
            @input="v => { block.data.minValue = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Clip to max
          </q-item-label>
          <InputField
            :value="block.data.maxValue"
            type="number"
            title="Value max"
            tag="big"
            @input="v => { block.data.maxValue = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
          <ConstraintsField
            :value="block.data.constrainedBy"
            :service-id="serviceId"
            type="analog"
            @input="v => { block.data.constrainedBy = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
