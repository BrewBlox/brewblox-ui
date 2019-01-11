<script lang="ts">
import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class SetpointSimpleForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          setting: new Unit(0, 'degC'),
          enabled: true,
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar v-if="$props.buttons" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="help" label="Settings">
      <div>
        <q-field label="Setpoint">
          <UnitPopupEdit
            :field="block.data.setting"
            :change="callAndSaveBlock(v => block.data.setting = v)"
            label="Setpoint"
          />
        </q-field>
        <q-field label="Enabled">
          <q-toggle
            :value="block.data.enabled"
            @input="v => { block.data.enabled = v; saveBlock(); }"
          />
        </q-field>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="help" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
