<script lang="ts">
import { Component } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { Setpoint, SetpointProfileBlock } from '@/plugins/spark/features/SetpointProfile/types';

import PartBase from '../components/PartBase';
import { settingsBlock } from '../helpers';


@Component
export default class ProfileDisplay extends PartBase {
  get block(): SetpointProfileBlock | null {
    return settingsBlock(this.part, 'profile');
  }

  get points(): Setpoint[] {
    if (!this.block) {
      return [];
    }
    return [...this.block.data.points]
      .sort(objectSorter('time'));
  }

  get currentValue(): number | null {
    if (!this.block || !this.block.data.enabled) {
      return null;
    }
    const now = new Date().getTime() / 1000;
    const start = this.block.data.start || 0;
    const idx = this.points.findIndex(point => start + point.time > now);
    if (idx < 1) {
      return null;
    }
    const prev = this.points[idx - 1];
    const next = this.points[idx];
    const prevVal = prev.temperature.value as number;
    const nextVal = next.temperature.value as number;
    const duration = (next.time - prev.time) || 1;
    return prevVal + (now - start + prev.time) * (nextVal - prevVal) / duration;
  }

  get nextValue(): number | null {
    if (!this.block) {
      return null;
    }
    const now = new Date().getTime() / 1000;
    const start = this.block.data.start || 0;
    if (!this.block.data.enabled || !this.block.data.drivenTargetId.id) {
      return null;
    }
    // Sorting modifies the list. Make a copy to prevent this.
    const point: Setpoint | undefined = this.points
      .find(point => start + point.time > now);
    return point ? point.temperature.value : null;
  }
}
</script>

<template>
  <g>
    <foreignObject :width="squares(2)" :height="squares(1)">
      <div :class="['text-white', 'text-bold', 'q-ml-sm', 'q-mt-xs']">
        <small>Setpoint Profile</small>
        <q-space />
        <div v-if="block" class="row q-ml-xs">
          <div class="col-auto q-mr-xs no-wrap">
            {{ currentValue | round(0) }}
          </div>
          <div class="col-auto q-mr-xs">
            <q-icon name="mdi-arrow-right-bold" />
          </div>
          <div class="col-auto">
            {{ nextValue | round(0) }}
          </div>
        </div>
        <div v-else class="q-ml-lg">
          <q-icon v-if="!block" name="mdi-link-variant-off" />
        </div>
      </div>
    </foreignObject>
    <g class="outline">
      <rect
        :width="squares(sizeX)-2"
        :height="squares(sizeY)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
