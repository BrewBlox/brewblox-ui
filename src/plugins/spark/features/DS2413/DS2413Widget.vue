<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DS2413Block } from './types';

@Component
export default class DS2413Widget extends BlockWidget {
  block!: DS2413Block;

  get address() {
    return this.block.data.address;
  }

  get pinState() {
    return {
      latchA: (this.block.data.state & 2) !== 0,
      latchB: (this.block.data.state & 8) !== 0,
      senseA: (this.block.data.state & 1) !== 0,
      senseB: (this.block.data.state & 4) !== 0,
    };
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <DS2413Form v-if="modalOpen" v-bind="$props" :block="block" @update:block="saveBlock"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <q-item dark>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Latches</q-item-label>
          <div>
            <q-toggle :value="pinState.latchA" class="col-6" readonly label="Latch A"/>
            <q-toggle :value="pinState.latchB" class="col-6" readonly label="Latch B"/>
          </div>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
        <q-item-section style="justify-content: flex-start">
          <q-item-label caption>Sensing</q-item-label>
          <div>
            <q-toggle :value="pinState.senseA" class="col-6" readonly label="Sense A"/>
            <q-toggle :value="pinState.senseB" class="col-6" readonly label="Sense B"/>
          </div>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
