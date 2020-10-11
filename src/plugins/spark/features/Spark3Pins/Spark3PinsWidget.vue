<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { Spark3PinsBlock } from '@/plugins/spark/types';

@Component
export default class Spark3PinsWidget
  extends BlockWidgetBase<Spark3PinsBlock> {
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <IoArray :crud="crud" />

      <div v-if="mode === 'Full'" class="widget-body row">
        <q-separator inset />

        <div class="col-break" />

        <LabeledField
          label="Enable 5V"
          class="col-grow"
        >
          <q-toggle
            :value="block.data.enableIoSupply5V"
            dense
            @input="v => { block.data.enableIoSupply5V = v; saveBlock(); }"
          />
        </labeledfield>
        <LabeledField
          label="Enable 12V"
          class="col-grow"
        >
          <q-toggle
            :value="block.data.enableIoSupply12V"
            dense
            @input="v => { block.data.enableIoSupply12V = v; saveBlock(); }"
          />
        </LabeledField>

        <div class="col-break" />

        <LabeledField
          label="5V Voltage"
          class="col-grow"
        >
          {{ block.data.voltage5 | round }}
        </LabeledField>
        <LabeledField
          label="12V Voltage"
          class="col-grow"
        >
          {{ block.data.voltage12 | round }}
        </LabeledField>
      </div>
    </div>
  </CardWrapper>
</template>
