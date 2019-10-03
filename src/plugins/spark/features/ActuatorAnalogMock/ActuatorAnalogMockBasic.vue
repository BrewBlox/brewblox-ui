<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorAnalogMockBlock } from './types';

@Component
export default class ActuatorAnalogMockBasic extends BlockCrudComponent {
  readonly block!: ActuatorAnalogMockBlock;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />

    <q-card-section>
      <q-item dark class="align-children">
        <q-item-section>
          <q-item-label caption>
            Setting
          </q-item-label>
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
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Value
          </q-item-label>
          <big>{{ block.data.value | round }}</big>
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
