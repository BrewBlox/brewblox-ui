<script lang="ts">
import { Component } from 'vue-property-decorator';

import { prettyUnit } from '@/helpers/bloxfield';
import { sparkStore } from '@/plugins/spark/store';
import { TempSensorMockBlock, TempSensorOneWireBlock } from '@/plugins/spark/types';
import { BlockAddress } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { CENTER } from '../getters';
import { settingsAddress } from '../helpers';


@Component
export default class SensorDisplay extends PartBase {
  readonly addressKey = 'sensor';
  readonly scaleKey = 'scale';

  get scale(): number {
    return this.settings[this.scaleKey] ?? 1;
  }

  get address(): BlockAddress {
    return settingsAddress(this.part, this.addressKey);
  }

  get block(): TempSensorMockBlock | TempSensorOneWireBlock | null {
    const { serviceId, id } = this.address;
    return sparkStore.blockById(serviceId, id);
  }

  get isBroken(): boolean {
    return this.block == null
      && this.address.id !== null;
  }

  get temperature(): number | null {
    return this.block?.data.value?.value ?? null;
  }

  get tempUnit(): string {
    return prettyUnit(this.block?.data.value);
  }

  get color(): string {
    return this.liquidOnCoord(CENTER)[0] ?? '';
  }
}
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <SvgEmbedded
      :transform="textTransformation([1,1])"
      :width="squares(1)"
      :height="squares(1)"
      content-class="column items-center q-pt-xs"
    >
      <BrokenIcon v-if="isBroken" class="col" />
      <UnlinkedIcon v-else-if="!block" class="col" />
      <template v-else>
        <div class="col row q-pt-xs">
          <q-icon name="mdi-thermometer" class="static" size="20px" />
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
        :stroke="color"
        stroke-width="2px"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
  </g>
</template>
