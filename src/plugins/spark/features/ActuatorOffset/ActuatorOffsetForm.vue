<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { ActuatorOffsetBlock } from '@/plugins/spark/features/ActuatorOffset/state';
import { defaultData, presets } from './getters';

@Component
export default class ActuatorOffsetForm extends BlockForm {
  get block(): ActuatorOffsetBlock {
    return this.blockField as ActuatorOffsetBlock;
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
        :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
        :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
        class="full-width"
      />
      <div>
        <q-field label="Driven process value">
          <LinkPopupEdit
            :field="block.data.targetId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.targetId = v)"
            label="Driven process value"
          />
        </q-field>
        <q-field label="Reference process value">
          <LinkPopupEdit
            :field="block.data.referenceId"
            :service-id="block.serviceId"
            :change="callAndSaveBlock(v => block.data.referenceId = v)"
            label="Reference process value"
          />
        </q-field>
        <q-field label="Offset from setting or current value">
          <SelectPopupEdit
            :field="block.data.referenceSettingOrValue"
            :change="callAndSaveBlock(v => block.data.referenceSettingOrValue = v)"
            :options="[{label: 'Setting', value: 0}, {label: 'Measured value', value: 1}]"
            label="reference field"
          />
        </q-field>
        <q-field label="Target offset">
          <InputPopupEdit
            v-if="!isDriven"
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            label="Target offset"
            type="number"
          />
          <big>{{ block.data.setting | round }}</big>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-field>
        <q-field label="Current offset">
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
