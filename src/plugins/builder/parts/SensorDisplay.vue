<script lang="ts">
import { Component } from 'vue-property-decorator';

import { TempSensorMockBlock, TempSensorOneWireBlock } from '@/plugins/spark/block-types';

import PartBase from '../components/PartBase';
import { settingsBlock, settingsLink } from '../helpers';


@Component
export default class SensorDisplay extends PartBase {
  get block(): TempSensorMockBlock | TempSensorOneWireBlock | null {
    return settingsBlock(this.part, 'sensor');
  }

  get isBroken(): boolean {
    if (this.block) {
      return false;
    }
    const link = settingsLink(this.part, 'sensor');
    return !!link.serviceId && !!link.blockId;
  }

  get temperature(): number | null {
    return this.block?.data.value?.value ?? null;
  }

  get tempUnit(): string {
    return this.block?.data.value?.notation ?? '';
  }
}
</script>

<template>
  <g>
    <SvgEmbedded :transform="textTransformation([1,1])" :width="squares(1)" :height="squares(1)">
      <BrokenIcon v-if="isBroken" />
      <UnlinkedIcon v-else-if="!block" />
      <template v-else>
        <div class="col row q-pt-xs">
          <q-icon name="mdi-thermometer" size="20px" />
          <small>{{ tempUnit }}</small>
        </div>
        <div class="col text-bold text-center">
          {{ temperature | round(1) }}
        </div>
      </template>
    </SvgEmbedded>
    <g class="outline">
      <rect
        :width="squares(1)-2"
        :height="squares(1)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
