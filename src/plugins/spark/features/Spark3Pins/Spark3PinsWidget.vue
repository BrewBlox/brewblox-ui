<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { Spark3PinsBlock } from './types';

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

    <IoArray :crud="crud" />

    <template v-if="mode === 'Full'">
      <q-separator inset />
      <q-card-section class="q-pt-sm">
        <q-item>
          <q-item-section>
            <LabeledField label="Enable 5V">
              <q-toggle
                :value="block.data.enableIoSupply5V"
                dense
                @input="v => { block.data.enableIoSupply5V = v; saveBlock(); }"
              />
            </LabeledField>
          </q-item-section>
          <q-item-section>
            <LabeledField label="Enable 12V">
              <q-toggle
                :value="block.data.enableIoSupply12V"
                dense
                @input="v => { block.data.enableIoSupply12V = v; saveBlock(); }"
              />
            </LabeledField>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <LabeledField label="5V Voltage">
              {{ block.data.voltage5 | round }}
            </LabeledField>
          </q-item-section>
          <q-item-section>
            <LabeledField label="12V Voltage">
              {{ block.data.voltage12 | round }}
            </LabeledField>
          </q-item-section>
        </q-item>
      </q-card-section>
    </template>
  </CardWrapper>
</template>
