<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { Unit } from '@/helpers/units';

@Component
export default class MutexForm extends BlockForm {
  defaultData() {
    return {
      differentActuatorWait: new Unit(0, 'second'),
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
      <q-expansion-item class="text-h6" opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>Idle time before allowing a different actuator</q-item-section>
          <q-item-section>
            <TimeUnitPopupEdit
              :field="block.data.differentActuatorWait"
              :change="callAndSaveBlock(v => block.data.differentActuatorWait = v)"
              type="number"
              label="minimum idle time"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item class="text-h6" group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
