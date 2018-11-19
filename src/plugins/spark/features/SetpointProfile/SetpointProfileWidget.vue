<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { SetpointProfileBlock } from './state';
import { getById } from './getters';
import { PlotData, Layout } from 'plotly.js';
import { Watch } from 'vue-property-decorator';

@Component
export default class SetpointProfileWidget extends BlockWidget {
  get block(): SetpointProfileBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'Setpoints',
    ];
  }

  get plotlyData(): Partial<PlotData>[] {
    // console.log(this.block.data.points.map(p => p.temperature.value));
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
  <div>
    <q-modal v-model="modalOpen">
      <SetpointProfileForm v-if="modalOpen" :field="block" :change="saveBlock" />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit :field="widgetId" label="Widget ID" display="span" :change="v => widgetId = v" />
        <span class="vertical-middle on-left" slot="right">{{ this.subtitle }}</span>
        <q-btn flat round dense slot="right" @click="openModal" icon="settings" />
        <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh" />
      </q-card-title>
      <q-card-separator />

      <q-carousel class="col" v-model="slideIndex">
        <q-carousel-slide class="unpadded">
          <GraphDisplay v-if="!modalOpen" :data="plotlyData" :layout="plotlyLayout" />
        </q-carousel-slide>
        <q-btn slot="quick-nav" slot-scope="props" color="white" flat dense :icon="navIcon(props.slide)" :label="navTitle(props.slide)" @click="props.goToSlide()" :class="{inactive: !props.current}" />
      </q-carousel>

    </q-card>
  </div>
</template>

<style scoped>
</style>
