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

  get subtitles() {
    return [
      'Setpoints',
    ];
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
  <div>
    <q-modal v-model="modalOpen">
      <SetpointProfileForm
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
        :changeId="changeBlockId"
      />
    </q-modal>
    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit
          class="ellipsis"
          :field="widgetId"
          label="Widget ID"
          display="span"
          :change="v => widgetId = v"
        />
        <span class="vertical-middle on-left" slot="right">{{ this.subtitle }}</span>
        <q-btn flat round dense slot="right" @click="openModal" icon="settings"/>
        <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh"/>
      </q-card-title>
      <q-card-separator/>
      <q-carousel class="col" v-model="slideIndex">
        <q-carousel-slide class="unpadded">
          <GraphDisplay v-if="!modalOpen" :data="plotlyData" :layout="plotlyLayout"/>
        </q-carousel-slide>
        <q-btn
          slot="quick-nav"
          slot-scope="props"
          color="white"
          flat
          dense
          :icon="navIcon(props.slide)"
          :label="navTitle(props.slide)"
          @click="props.goToSlide()"
          :class="{inactive: !props.current}"
        />
      </q-carousel>
    </q-card>
  </div>
</template>

<style scoped>
</style>
