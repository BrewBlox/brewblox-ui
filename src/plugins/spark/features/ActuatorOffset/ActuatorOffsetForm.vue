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
  <q-card dark class="widget-modal">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item class="text-h6" opened group="modal" icon="settings" label="Settings">
        <BlockEnableToggle
          v-bind="$props"
          :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
          :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
        />
        <q-item dark>
          <q-item-section>Driven Process value</q-item-section>
          <q-item-section>
            <LinkPopupEdit
              :field="block.data.targetId"
              :service-id="block.serviceId"
              :change="callAndSaveBlock(v => block.data.targetId = v)"
              label="Driven process value"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Reference process value</q-item-section>
          <q-item-section>
            <LinkPopupEdit
              :field="block.data.referenceId"
              :service-id="block.serviceId"
              :change="callAndSaveBlock(v => block.data.referenceId = v)"
              label="Reference process value"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Offset from setting or current value</q-item-section>
          <q-item-section>
            <SelectPopupEdit
              :field="block.data.referenceSettingOrValue"
              :change="callAndSaveBlock(v => block.data.referenceSettingOrValue = v)"
              :options="[{label: 'Setting', value: 0}, {label: 'Measured value', value: 1}]"
              label="reference field"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <div class="column">
              <span>Target Offset</span>
              <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
            </div>
          </q-item-section>
          <q-item-section>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              label="Target offset"
              type="number"
            />
            <big v-else>{{ block.data.setting | round }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Current offset</q-item-section>
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

    <div v-if="false" class="widget-modal column">
      <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>
      <q-expansion-item class="text-h6" opened group="modal" icon="settings" label="Settings">
        <BlockEnableToggle
          v-bind="$props"
          :block="block"
          :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
          :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
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
      </q-expansion-item>
      <q-expansion-item
        class="text-h6"
        group="modal"
        icon="mdi-less-than-or-equal"
        label="Constraints"
      >
        <div>
          <q-field label="Constraints" orientation="vertical">
            <AnalogConstraints
              :service-id="block.serviceId"
              :field="block.data.constrainedBy"
              :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            />
          </q-field>
        </div>
      </q-expansion-item>

      <q-expansion-item class="text-h6" group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </div>
  </q-card>
</template>
