<script lang="ts">
import { Layout, PlotData } from 'plotly.js';
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { SetpointProfileBlock } from './types';

@Component
export default class SetpointProfileWidget extends BlockWidget {
  readonly block!: SetpointProfileBlock;
  revision: number = 0;
  modalOpen: boolean = false;
  now: Date = new Date();

  get startTime(): number {
    return this.block.data.start * 1000;
  }

  get plotlyData(): Partial<PlotData>[] {
    return [{
      name: 'Setpoints',
      type: 'scatter',
      x: this.block.data.points.map(p => this.startTime + (p.time * 1000)),
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

  // Overrides BlockWidget
  openModal() {
    this.modalOpen = true;
  }

  mounted() {
    this.$watch('block', () => this.now = new Date());
    this.$watch('widget.cols', () => this.revision++);
    this.$watch('widget.rows', () => this.revision++);
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <BlockWidgetToolbar :crud="crud" :graph-props="{data: plotlyData, layout: plotlyLayout}" />
    <CardWarning v-if="!block.data.targetId.id">
      <template #message>Target setpoint is not configured for this profile.</template>
    </CardWarning>

    <CardWarning v-else-if="!block.data.enabled">
      <template #message>
        <span>
          Profile is disabled: <i>{{ block.data.targetId }}</i> will not be changed.
        </span>
      </template>
      <template #actions>
        <q-btn
          text-color="white"
          flat
          label="Enable"
          @click="block.data.enabled = true; saveBlock()"
        />
      </template>
    </CardWarning>
    <div class="col">
      <Graph :data="plotlyData" :layout="plotlyLayout" :revision="revision" />
    </div>
  </q-card>
</template>
