<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { TempSensorMockBlock } from './types';

@Component
export default class TempSensorMockForm extends BlockForm {
  readonly block!: TempSensorMockBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Value</q-item-label>
            <UnitPopupEdit
              :field="block.data.value"
              :disabled="!block.data.connected"
              :change="callAndSaveBlock(v => block.data.value = v)"
              label="Value"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Connected</q-item-label>
            <q-toggle
              :value="block.data.connected"
              @input="v => { block.data.connected = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
