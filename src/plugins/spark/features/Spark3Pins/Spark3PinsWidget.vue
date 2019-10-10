<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { Spark3PinsBlock } from './types';

@Component
export default class Spark3PinsWidget extends BlockWidgetBase {
  readonly block!: Spark3PinsBlock;
}
</script>

<template>
  <q-card dark :class="cardClass">
    <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />

    <IoArray :crud="crud" />

    <template v-if="mode === 'Full'">
      <q-separator dark inset />
      <q-card-section>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>
              Enable 5V
            </q-item-label>
            <q-toggle
              :value="block.data.enableIoSupply5V"
              @input="v => { block.data.enableIoSupply5V = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>
              Enable 12V
            </q-item-label>
            <q-toggle
              :value="block.data.enableIoSupply12V"
              @input="v => { block.data.enableIoSupply12V = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>
              5V Voltage
            </q-item-label>
            {{ block.data.voltage5 | round }}
          </q-item-section>
          <q-item-section>
            <q-item-label caption>
              12V Voltage
            </q-item-label>
            {{ block.data.voltage12 | round }}
          </q-item-section>
          <q-item-section>
          <!-- <q-item-label caption>Alarm sound</q-item-label>
          <q-toggle
            :value="block.data.soundAlarm"
            @input="v => { block.data.soundAlarm = v; saveBlock(); }"
          />-->
          </q-item-section>
        </q-item>
      </q-card-section>
    </template>
  </q-card>
</template>
