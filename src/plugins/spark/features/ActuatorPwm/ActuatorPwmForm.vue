<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';

@Component
export default class ActuatorPwmForm extends BlockCrudComponent {
  readonly block!: ActuatorPwmBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <BlockEnableToggle
          v-bind="$props"
          :text-enabled="`PWM is enabled: ${block.data.actuatorId} will be toggled automatically.`"
          :text-disabled="`PWM is disabled: ${block.data.actuatorId} will not be toggled.`"
          v-on="$listeners"
        />

        <q-item dark>
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
          <q-item-section>
            <q-item-label caption>Period</q-item-label>
            <TimeUnitField
              :value="block.data.period"
              title="Period"
              tag="big"
              @input="v => { block.data.period = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Duty setting</q-item-label>
            <SliderField
              :value="block.data.desiredSetting"
              :readonly="isDriven"
              tag="big"
              title="Setting"
              @input="v => { block.data.desiredSetting = v; saveBlock(); }"
            />
            <DrivenIndicator :block-id="block.id" :service-id="serviceId" />
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Duty Achieved</q-item-label>
            <big>{{ block.data.value | round }}</big>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-less-than-or-equal" label="Constraints">
        <q-item dark>
          <q-item-section>
            <AnalogConstraints
              :value="block.data.constrainedBy"
              :service-id="serviceId"
              @input="v => { block.data.constrainedBy = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
