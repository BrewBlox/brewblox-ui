<script lang="ts">
import { Component } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { Setpoint, SetpointProfileBlock } from '@/plugins/spark/features/SetpointProfile/types';
import { SetpointSensorPairBlock } from '@/plugins/spark/features/SetpointSensorPair/types';
import { sparkStore } from '@/plugins/spark/store';

import PartBase from '../components/PartBase';
import { settingsBlock } from '../helpers';


@Component
export default class ProfileDisplay extends PartBase {
  get block(): SetpointProfileBlock | null {
    return settingsBlock(this.part, 'profile');
  }

  get currentValue(): number | null {
    if (!this.block) {
      return null;
    }
    const targetId = this.block.data.drivenTargetId.id;
    if (!targetId) {
      return null;
    }
    const target: SetpointSensorPairBlock = sparkStore.blockById(this.block.serviceId, targetId);
    return target.data.setting.value;
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
    const point: Setpoint | undefined = [...this.block.data.points]
      .sort(objectSorter('time'))
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
        <div v-if="block" class="row q-ml-sm">
          <div class="col-auto q-mr-sm">
            {{ currentValue | round(0) }}
          </div>
          <div class="col-auto q-mr-sm">
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
