<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorAnalogMockBlock } from './types';

@Component
export default class ActuatorAnalogMockBasic
  extends BlockCrudComponent<ActuatorAnalogMockBlock> {
}
</script>

<template>
  <div>
    <slot name="warnings" />

    <q-card-section>
      <q-item>
        <q-item-section>
          <SliderField
            :value="block.data.setting"
            :readonly="isDriven"
            title="Analog actuator Setting"
            label="Setting"
            tag="big"
            class="self-start"
            :tag-class="{'text-orange': block.data.setting !== block.data.desiredSetting}"
            @input="v => { block.data.desiredSetting = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <LabeledField :value="block.data.value" type="number" tag="big" />
        </q-item-section>
      </q-item>

      <q-item>
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
  </div>
</template>
