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
  <div class="widget-modal column">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>
    <q-collapsible opened group="modal" class="col-12" icon="settings" label="Settings">
      <BlockEnableToggle
        v-bind="$props"
        :block="block"
        :text="`Toggling target ${block.data.actuatorId} is`"
        class="full-width bordered"
      />
      <div>
        <q-field label="Digital Actuator Target">
          <LinkPopupEdit
            :field="block.data.actuatorId"
            :service-id="serviceId"
            :change="callAndSaveBlock(v => block.data.actuatorId = v)"
            label="target"
          />
        </q-field>
        <q-field label="Period">
          <TimeUnitPopupEdit
            :field="block.data.period"
            :change="callAndSaveBlock(v => block.data.period = v)"
            label="Period"
            type="number"
          />
        </q-field>
        <q-field label="Duty Setting">
          <InputPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            label="Setting"
            type="number"
          />
        </q-field>
        <q-field label="Duty Achieved">
          <big>{{ block.data.value | round }}</big>
        </q-field>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-less-than-or-equal" label="Constraints">
      <div>
        <q-field label="Constraints" orientation="vertical">
          <AnalogConstraints
            :service-id="block.serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
          />
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>
