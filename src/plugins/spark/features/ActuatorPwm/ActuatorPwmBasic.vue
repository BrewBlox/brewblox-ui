<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { ActuatorPwmBlock } from './types';

@Component
export default class ActuatorPwmBasic extends BlockCrudComponent {
  readonly block!: ActuatorPwmBlock;

  get isConstrained(): boolean {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item>
        <q-item-section>
          <SliderField
            :value="block.data.setting"
            :readonly="isDriven"
            :tag-class="{['text-orange']: isConstrained}"
            title="Duty Setting"
            label="Setting"
            suffix="%"
            tag="big"
            @input="v => { block.data.desiredSetting = v; saveBlock(); }"
          />
        </q-item-section>

        <q-item-section>
          <ValueField
            :value="block.data.value"
            label="Duty achieved"
            number
            suffix="%"
            tag="big"
          />
        </q-item-section>

        <q-item-section>
          <ValueField
            v-if="isConstrained"
            label="Unconstrained setting"
            :value="block.data.desiredSetting"
            number
            suffix="%"
            tag="big"
          />
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
  </q-card>
</template>
