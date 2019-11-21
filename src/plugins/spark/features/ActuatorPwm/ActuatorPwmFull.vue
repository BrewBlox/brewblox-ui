<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';

@Component
export default class ActuatorPwmFull extends BlockCrudComponent {
  readonly block!: ActuatorPwmBlock;

  quickValues = [
    { label: '0%', value: 0 },
    { label: '50%', value: 50 },
    { label: '100%', value: 100 },
  ]

  get isConstrained(): boolean {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings">
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`PWM is enabled: ${block.data.actuatorId} will be toggled automatically.`"
        :text-disabled="`PWM is disabled: ${block.data.actuatorId} will not be toggled.`"
      />
    </slot>

    <q-card-section>
      <q-item>
        <q-item-section class="col-4">
          <TimeUnitField
            :value="block.data.period"
            title="Period"
            label="Period"
            tag="big"
            @input="v => { block.data.period = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <BlockField
            :value="block.data.actuatorId"
            :service-id="serviceId"
            title="target"
            label="Digital Actuator Target"
            tag="big"
            @input="v => { block.data.actuatorId = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
      <q-item class="align-children">
        <q-item-section>
          <SliderField
            :value="block.data.setting"
            :readonly="isDriven"
            :quick-actions="quickValues"
            label="Duty setting"
            tag="big"
            :tag-class="{['text-orange']: isConstrained}"
            title="Setting"
            @input="v => { block.data.desiredSetting = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <LabeledField
            :value="block.data.value"
            number
            label="Duty achieved"
            tag="big"
            suffix="%"
          />
        </q-item-section>
        <q-item-section>
          <LabeledField
            v-if="isConstrained"
            label="Unconstrained setting"
            :value="block.data.desiredSetting"
            number
            tag="big"
            suffix="%"
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
