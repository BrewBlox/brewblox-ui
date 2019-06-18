<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';
import { Spark3PinId, Spark3PinsBlock } from '@/plugins/spark/features/Spark3Pins/types';

@Component
export default class Spark3PinsForm extends BlockForm {
  Spark3PinId = Spark3PinId;
  readonly block!: Spark3PinsBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props" v-on="$listeners"/>

    <IoArray v-bind="$props" :id-enum="Spark3PinId" v-on="$listeners"/>
    <q-separator dark inset/>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Enable 5V</q-item-label>
          <q-toggle
            :value="block.data.enableIoSupply5V"
            @input="v => { block.data.enableIoSupply5V = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Enable 12V</q-item-label>
          <q-toggle
            :value="block.data.enableIoSupply12V"
            @input="v => { block.data.enableIoSupply12V = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Enable LCD backlight</q-item-label>
          <q-toggle
            :value="block.data.enableLcdBacklight"
            @input="v => { block.data.enableLcdBacklight = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>5V Voltage</q-item-label>
          {{ block.data.voltage5 | round }}
        </q-item-section>
        <q-item-section>
          <q-item-label caption>12V Voltage</q-item-label>
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
  </q-card>
</template>
