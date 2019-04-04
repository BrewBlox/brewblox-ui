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
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <BlockEnableToggle
          v-bind="$props"
          :text-enabled="`Offset is enabled: ${block.data.targetId} will be offset from the
          ${block.data.referenceSettingOrValue == 0 ? 'setting' : 'value'} of ${block.data.referenceId}.`"
          :text-disabled="`Offset is disabled: ${block.data.targetId} will not be changed.`"
        />
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Driven block</q-item-label>
            <LinkPopupEdit
              :field="block.data.targetId"
              :service-id="block.serviceId"
              :change="callAndSaveBlock(v => block.data.targetId = v)"
              label="Driven block"
              tag="span"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Offset from</q-item-label>
            <div>
              <LinkPopupEdit
                :field="block.data.referenceId"
                :service-id="block.serviceId"
                :change="callAndSaveBlock(v => block.data.referenceId = v)"
                label="Reference block"
                tag="span"
                style="display: inline-block"
              />
              <span class="q-px-xs">&gt;</span>
              <SelectPopupEdit
                :field="block.data.referenceSettingOrValue"
                :change="callAndSaveBlock(v => block.data.referenceSettingOrValue = v)"
                :options="[{label: 'Setting', value: 0}, {label: 'Measured value', value: 1}]"
                label="reference field"
                tag="span"
                style="display: inline-block"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Target Offset</q-item-label>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              label="Target offset"
              type="number"
            />
            <big v-else>{{ block.data.setting | round }}</big>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Current offset</q-item-label>
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
