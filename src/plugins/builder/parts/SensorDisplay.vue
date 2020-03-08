<script lang="ts">
import { Component } from 'vue-property-decorator';

import { TempSensorMockBlock, TempSensorOneWireBlock } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { settingsAddress } from '../helpers';


@Component
export default class SensorDisplay extends PartBase {
  settingsKey = 'sensor';

  get address(): BlockAddress {
    return settingsAddress(this.part, this.settingsKey);
  }

  get block(): TempSensorMockBlock | TempSensorOneWireBlock | null {
    const { serviceId, id } = this.address;
    return sparkStore.tryBlockById(serviceId, id);
  }

  get isBroken(): boolean {
    return this.block == null
      && this.address.id !== null;
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
