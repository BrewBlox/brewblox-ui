<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class ActuatorAnalogMockForm extends BlockForm {
  defaultData() {
    return {
      setting: 0,
      minSetting: 0,
      maxSetting: 100,
      value: 0,
      minValue: 0,
      maxValue: 100,
    };
  }

  presets() {
    return [];
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section style="justify-content: space-between">
            <q-item-label caption>Setting</q-item-label>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              type="number"
              label="target"
            />
            <big v-else>{{ block.data.setting | unit }}</big>
          </q-item-section>
          <q-item-section style="justify-content: space-between">
            <q-item-label caption>Clip to min</q-item-label>
            <InputPopupEdit
              :field="block.data.minSetting"
              :change="callAndSaveBlock(v => block.data.minSetting = v)"
              type="number"
              label="Setting min"
            />
          </q-item-section>
          <q-item-section style="justify-content: space-between">
            <q-item-label caption>Clip to max</q-item-label>
            <InputPopupEdit
              :field="block.data.maxSetting"
              :change="callAndSaveBlock(v => block.data.maxSetting = v)"
              type="number"
              label="Setting max"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Value</q-item-label>
            <big>{{ block.data.value | round }}</big>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Clip to min</q-item-label>
            <InputPopupEdit
              :field="block.data.minValue"
              :change="callAndSaveBlock(v => block.data.minValue = v)"
              type="number"
              label="Value min"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Clip to max</q-item-label>
            <InputPopupEdit
              :field="block.data.maxValue"
              :change="callAndSaveBlock(v => block.data.maxValue = v)"
              type="number"
              label="Value max"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-less-than-or-equal" label="Constraints">
        <AnalogConstraints
          :service-id="block.serviceId"
          :field="block.data.constrainedBy"
          :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
        />
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
