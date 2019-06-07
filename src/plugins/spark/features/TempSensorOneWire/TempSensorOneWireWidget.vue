<script lang="ts">
import { Component } from 'vue-property-decorator';

import { postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { TempSensorOneWireBlock } from './types';

@Component
export default class TempSensorOneWireWidget extends BlockWidget {
  readonly block!: TempSensorOneWireBlock;

  get renamedTargets() {
    return postfixedDisplayNames(
      {
        value: 'Sensor value',
      },
      this.block.data,
    );
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <TempSensorOneWireForm
        v-if="modalOpen"
        v-bind="$props"
        :block="block"
        @update:block="saveBlock"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item v-if="block.data.value === null" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>This sensor is invalid</q-item-section>
      </q-item>
      <q-item v-else dark>
        <q-item-section>
          <q-item-label caption>Value</q-item-label>
          <UnitField :value="block.data.value" readonly/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
