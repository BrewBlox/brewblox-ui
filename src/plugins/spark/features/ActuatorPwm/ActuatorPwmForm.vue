<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';
import Component from 'vue-class-component';
import { defaultData, presets } from './getters';

@Component
export default class ActuatorPwmForm extends BlockForm {
  get block(): ActuatorPwmBlock {
    return this.blockField as ActuatorPwmBlock;
  }

  defaultData() {
    return defaultData();
  }

  presets() {
    return presets();
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <BlockEnableToggle
          v-bind="$props"
          :text-enabled="`PWM is enabled: ${block.data.actuatorId} will be toggled automatically.`"
          :text-disabled="`PWM is disabled: ${block.data.actuatorId} will not be toggled.`"
        />

        <q-item dark>
          <q-item-section>
            <q-item-label caption>Digital Actuator Target</q-item-label>
            <LinkPopupEdit
              :field="block.data.actuatorId"
              :service-id="serviceId"
              :change="callAndSaveBlock(v => block.data.actuatorId = v)"
              label="target"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Period</q-item-label>
            <TimeUnitPopupEdit
              :field="block.data.period"
              :change="callAndSaveBlock(v => block.data.period = v)"
              label="Period"
              type="number"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Duty setting</q-item-label>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              label="Setting"
              type="number"
            />
            <big v-else>{{ block.data.setting | round }}</big>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
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
              :service-id="block.serviceId"
              :field="block.data.constrainedBy"
              :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
