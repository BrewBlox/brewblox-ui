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
    <q-dialog v-model="modalOpen" no-backdrop-dismiss class="row">
      <ScreenSizeConstrained
        v-if="modalOpen"
        :min-width="1500"
        class="q-mr-md"
        style="width: 600px;"
      >
        <q-card dark class="q-pa-xs bg-dark-bright">
          <Graph :data="plotlyData" :layout="plotlyLayout"/>
        </q-card>
      </ScreenSizeConstrained>
      <SetpointProfileForm
        v-if="modalOpen"
        v-bind="$props"
        :block="block"
        @update:block="saveBlock"
      />
    </q-dialog>

    <BlockWidgetToolbar :crud="crud"/>
    <div class="col-auto">
      <q-item v-if="!block.data.enabled" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>
          <span>
            Profile is disabled:
            <i>{{ block.data.targetId }}</i> will not be changed.
          </span>
        </q-item-section>
        <q-item-section side>
          <q-btn
            text-color="white"
            flat
            label="Enable"
            @click="block.data.enabled = true; saveBlock()"
          />
        </q-item-section>
      </q-item>
    </div>
    <div class="col">
      <Graph :data="plotlyData" :layout="plotlyLayout" :revision="revision"/>
    </div>
  </q-card>
</template>
