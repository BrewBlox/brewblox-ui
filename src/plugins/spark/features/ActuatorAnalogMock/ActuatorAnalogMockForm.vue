<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class ActuatorAnalogMockForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          setting: 0,
          minSetting: 0,
          maxSetting: 100,
          value: 0,
          minValue: 0,
          maxValue: 100,
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar v-if="$props.displayToolbar" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="settings" label="Settings">
      <div>
        <q-field label="Supported setting min">
          <InputPopupEdit
            :field="block.data.minSetting"
            :change="callAndSaveBlock(v => block.data.minSetting = v)"
            type="number"
            label="supported setting min"
          />
        </q-field>
        <q-field label="Target">
          <InputPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            type="number"
            label="target"
          />
        </q-field>
        <q-field label="Supported setting max">
          <InputPopupEdit
            :field="block.data.maxSetting"
            :change="callAndSaveBlock(v => block.data.maxSetting = v)"
            type="number"
            label="supported setting max"
          />
        </q-field>
        <q-field label="Value min (clipping)">
          <InputPopupEdit
            :field="block.data.minValue"
            :change="callAndSaveBlock(v => block.data.minValue = v)"
            type="number"
            label="value min"
          />
        </q-field>
        <q-field label="Value">
          <big>{{ block.data.value | round }}</big>
        </q-field>
        <q-field label="Value max (clipping)">
          <InputPopupEdit
            :field="block.data.maxValue"
            :change="callAndSaveBlock(v => block.data.maxValue = v)"
            type="number"
            label="value max"
          />
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
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
