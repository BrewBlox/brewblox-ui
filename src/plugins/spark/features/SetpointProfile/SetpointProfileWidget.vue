<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { Layout, PlotData } from 'plotly.js';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointProfileBlock } from './state';

@Component
export default class SetpointProfileWidget extends BlockWidget {
  get block(): SetpointProfileBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get plotlyData(): Partial<PlotData>[] {
    return [{
      name: 'Setpoints',
      type: 'scatter',
      x: this.block.data.points.map(p => p.time * 1000),
      y: this.block.data.points.map(p => p.temperature.value),
    }];
  }

  get plotlyLayout(): Partial<Layout> {
    return {};
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <SetpointProfileForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <div class="col">
      <GraphDisplay v-if="!modalOpen" :data="plotlyData" :layout="plotlyLayout"/>
    </div>
  </q-card>
</template>
