<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { TempSensorMockBlock } from './types';

@Component
export default class TempSensorMockWidget extends BlockWidgetBase {
  readonly block!: TempSensorMockBlock;

  get cardStyle(): Mapped<string> {
    return this.inDialog
      ? { minHeight: '40vh' }
      : {};
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" />
    </template>

    <q-card dark :class="cardClass" :style="cardStyle">
      <component :is="toolbarComponent" :crud="crud" />

      <q-card-section>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>
              Value
            </q-item-label>
            <UnitField
              :value="block.data.value"
              :readonly="!block.data.connected"
              title="Value"
              tag="big"
              @input="v => { block.data.value = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>
              Connected
            </q-item-label>
            <q-toggle
              :value="block.data.connected"
              @input="v => { block.data.connected = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </GraphCardWrapper>
</template>

