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
  <q-card dark class="column">
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <DS2413Form
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-field class="col" label="Address">
          <span>{{ address }}</span>
        </q-field>
        <q-field class="col" label="State">
          <q-toggle :value="pinState.latchA" readonly label="Latch A"/>
          <q-toggle :value="pinState.senseA" readonly label="Sense A"/>
          <q-toggle :value="pinState.latchB" readonly label="Latch B"/>
          <q-toggle :value="pinState.senseB" readonly label="Sense B"/>
          <DrivenIndicator :block-id="blockId" :service-id="serviceId"/>
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>

<style lang="stylus" scoped>
.q-toggle {
  padding: 0px 10px 10px 0px;
}

/deep/ .widget-body .q-field-margin {
  margin-top: 0px;
}
</style>
