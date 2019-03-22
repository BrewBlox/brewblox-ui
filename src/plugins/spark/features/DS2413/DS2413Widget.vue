<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { DS2413Block } from './state';

@Component
export default class DS2413Widget extends BlockWidget {
  get block(): DS2413Block {
    return getById(this.$store, this.serviceId, this.blockId);
  }

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
      <DS2413Form
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <q-item dark>
        <q-item-section>Address</q-item-section>
        <q-item-section>{{ address }}</q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <div class="column">
            <span>State</span>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </div>
        </q-item-section>
        <q-item-section>
          <div class="col">
            <q-toggle :value="pinState.latchA" readonly label="Latch A"/>
            <q-toggle :value="pinState.senseA" readonly label="Sense A"/>
            <q-toggle :value="pinState.latchB" readonly label="Latch B"/>
            <q-toggle :value="pinState.senseB" readonly label="Sense B"/>
          </div>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
