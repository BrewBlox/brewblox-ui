<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/state';
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
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item class="text-h6" opened group="modal" icon="settings" label="Settings">
        <BlockEnableToggle
          v-bind="$props"
          :text-enabled="`PWM is enabled: ${block.data.actuatorId} will be toggled automatically.`"
          :text-disabled="`PWM is disabled: ${block.data.actuatorId} will not be toggled.`"
        />

        <q-item dark>
          <q-item-section>Digital Actuator Target</q-item-section>
          <q-item-section>
            <LinkPopupEdit
              :field="block.data.actuatorId"
              :service-id="serviceId"
              :change="callAndSaveBlock(v => block.data.actuatorId = v)"
              label="target"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Period</q-item-section>
          <q-item-section>
            <TimeUnitPopupEdit
              :field="block.data.period"
              :change="callAndSaveBlock(v => block.data.period = v)"
              label="Period"
              type="number"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <div class="column">
              <span>Duty setting</span>
              <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
            </div>
          </q-item-section>
          <q-item-section>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              label="Setting"
              type="number"
            />
            <big v-else>{{ block.data.setting | round }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Duty Achieved</q-item-section>
          <q-item-section>
            <big>{{ block.data.value | round }}</big>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        class="text-h6"
        group="modal"
        icon="mdi-less-than-or-equal"
        label="Constraints"
      >
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

      <q-expansion-item class="text-h6" group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
