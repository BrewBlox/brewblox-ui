<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { state } from './getters';
import { ActuatorPinBlock } from './state';

@Component
export default class ActuatorPinForm extends BlockForm {
  get block(): ActuatorPinBlock {
    return this.blockField as ActuatorPinBlock;
  }

  defaultData() {
    return {
      state: 2,
      invert: false,
      constrainedBy: { constraints: [], unconstrained: 0 },
    };
  }

  presets() {
    return [
      {
        label: 'Fridge compressor',
        value: {
          state: 0,
          invert: false,
          constrainedBy: {
            constraints: [
              { "minOff[second]": 300 },
              { "minOn[second]": 180 },
            ],
          },
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
      <q-field label="Active">
        <ActuatorState
          :field="block.data.state"
          :change="callAndSaveBlock(v => block.data.state = v)"
        />
      </q-field>
      <q-field label="Inverted">
        <q-toggle :value="block.data.invert" @input="v => { block.data.invert = v; saveBlock(); }"/>
      </q-field>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-less-than-or-equal" label="Constraints">
      <q-field label="Constraints" orientation="vertical">
        <DigitalConstraints
          :service-id="block.serviceId"
          :field="block.data.constrainedBy"
          :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
        />
      </q-field>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
