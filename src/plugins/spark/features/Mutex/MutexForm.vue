<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class MutexForm extends BlockForm {
  defaultData() {
    return {
      differentActuatorWait: 0,
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
      <q-field label="Idle time before allowing a different actuator">
        <TimeUnitPopupEdit
          :field="block.data.differentActuatorWait"
          :change="callAndSaveBlock(v => block.data.differentActuatorWait = v)"
          type="number"
          label="minimum idle time"
        />
      </q-field>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>
