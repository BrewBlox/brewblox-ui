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
  <q-card dark class="widget-modal">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item opened group="modal" icon="settings" label="Settings">
        <q-item>
          <q-item-section side>Target</q-item-section>
          <q-item-section>
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
          </q-item-section>
          <q-item-section>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section side>Enabled</q-item-section>
          <q-item-section>
            <q-toggle
              :value="block.data.enabled"
              @input="v => { block.data.enabled = v; saveBlock(); }"
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
