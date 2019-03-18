<script lang="ts">
import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class SetpointSimpleForm extends BlockForm {
  defaultData() {
    return {
      setting: new Unit(null, 'degC'),
      setpoint: new Unit(20, 'degC'),
      enabled: false,
    };
  }

  presets() {
    return [];
  }
}
</script>

<template>
  <div class="widget-modal column">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>
    <q-collapsible opened group="modal" class="col-12" icon="settings" label="Settings">
      <div>
        <q-field label="Target">
          <UnitPopupEdit
            v-if="!isDriven"
            :class="{ darkened: block.data.setting.value === null }"
            :field="block.data.setpoint"
            :change="callAndSaveBlock(v => block.data.setpoint = v)"
            label="Target"
          />
          <big
            v-else
            :class="{ darkened: block.data.setting.value === null }"
          >{{ block.data.setpoint | unit }}</big>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-field>
        <q-field label="Enabled">
          <q-toggle
            :value="block.data.enabled"
            @input="v => { block.data.enabled = v; saveBlock(); }"
          />
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>
