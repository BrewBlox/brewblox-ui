<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';

@Component
export default class ActuatorPwmForm extends BlockCrudComponent {
  readonly block!: ActuatorPwmBlock;

  get isConstrained() {
    return this.block.data.enabled
      && this.block.data.setting !== this.block.data.desiredSetting;
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />

    <q-card-section>
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`PWM is enabled: ${block.data.actuatorId} will be toggled automatically.`"
        :text-disabled="`PWM is disabled: ${block.data.actuatorId} will not be toggled.`"
      />

      <q-item dark>
        <q-item-section>
          <q-item-label caption>Period</q-item-label>
          <TimeUnitField
            :value="block.data.period"
            title="Period"
            tag="big"
            @input="v => { block.data.period = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Digital Actuator Target</q-item-label>
          <LinkField
            :value="block.data.actuatorId"
            :service-id="serviceId"
            title="target"
            tag="big"
            @input="v => { block.data.actuatorId = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section />
      </q-item>
      <q-item dark class="align-children">
        <q-item-section>
          <q-item-label caption>Duty setting</q-item-label>
          <div :class="{['text-orange']: isConstrained}">
            <SliderField
              :value="block.data.setting"
              :readonly="isDriven"
              tag="big"
              title="Setting"
              @input="v => { block.data.desiredSetting = v; saveBlock(); }"
            />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Duty Achieved</q-item-label>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
        <q-item-section>
          <template v-if="isConstrained">
            <q-item-label caption>Unconstrained setting</q-item-label>
            <div>
              <big>{{ block.data.desiredSetting | round }}</big>
              <small class="q-ml-xs">%</small>
            </div>
          </template>
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
