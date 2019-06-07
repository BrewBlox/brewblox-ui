<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { MutexBlock } from './types';

@Component
export default class MutexForm extends BlockForm {
  readonly block!: MutexBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Idle time before allowing a different actuator</q-item-label>
            <TimeUnitField
              :value="block.data.differentActuatorWait"
              title="Minimum idle time"
              @input="v => { block.data.differentActuatorWait = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
