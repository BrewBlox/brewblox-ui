<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { TempSensorMockBlock } from './types';

@Component
export default class TempSensorMockWidget
  extends BlockWidgetBase<TempSensorMockBlock> {

}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>

    <div class="widget-md widget-body row">
      <UnitField
        :value="block.data.value"
        :readonly="!block.data.connected"
        title="Value"
        label="Value"
        tag="big"
        class="col-grow"
        @input="v => { block.data.value = v; saveBlock(); }"
      />
      <LabeledField
        label="Connected"
        class="col-grow"
      >
        <q-toggle
          dense
          :value="block.data.connected"
          @input="v => { block.data.connected = v; saveBlock(); }"
        />
      </LabeledField>
    </div>
  </GraphCardWrapper>
</template>
