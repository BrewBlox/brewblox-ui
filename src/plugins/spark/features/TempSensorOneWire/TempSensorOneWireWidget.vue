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
    <BlockWidgetToolbar :crud="crud" :graph-cfg.sync="graphCfg"/>

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
          <UnitField :value="block.data.value" readonly tag="big"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
