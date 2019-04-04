<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { Layout, PlotData } from 'plotly.js';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointProfileBlock } from './state';
import { Watch } from 'vue-property-decorator';

@Component
export default class SetpointProfileWidget extends BlockWidget {
  now: Date = new Date();

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
    return {
      shapes: [
        {
          type: 'line',
          yref: 'paper',
          x0: this.now,
          x1: this.now,
          y0: 0,
          y1: 1,
          line: {
            color: 'rgb(0, 200, 0)',
            dash: 'dot',
          },
        },
      ],
    };
  }

  @Watch('block')
  refresh() {
    this.now = new Date();
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <SetpointProfileForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me"/>

    <div class="col">
      <GraphDisplay v-if="!modalOpen" :data="plotlyData" :layout="plotlyLayout"/>
    </div>
  </q-card>
</template>
