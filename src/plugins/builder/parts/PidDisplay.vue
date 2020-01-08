<script lang="ts">
import { Component } from 'vue-property-decorator';

import { blockTypes } from '@/plugins/spark/block-types';
import { PidBlock } from '@/plugins/spark/features/Pid/types';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { COLD_WATER, HOT_WATER } from '../getters';
import { settingsBlock, settingsLink } from '../helpers';


@Component
export default class PidDisplay extends PartBase {
  HOT_WATER = HOT_WATER;
  COLD_WATER = COLD_WATER;

  get block(): PidBlock | null {
    return settingsBlock(this.part, 'pid');
  }

  get isBroken(): boolean {
    if (this.block) {
      return false;
    }
    const link = settingsLink(this.part, 'pid');
    return !!link.serviceId && !!link.blockId;
  }

  get outputValue(): number | null {
    return this.block && this.block.data.enabled
      ? this.block.data.outputValue
      : null;
  }

  get outputSetting(): number | null {
    return this.block && this.block.data.enabled
      ? this.block.data.outputSetting
      : null;
  }

  get kp(): number | null {
    return this.block
      ? this.block.data.kp.value
      : null;
  }

  get target(): Block | null {
    return this.block === null
      ? null
      : sparkStore.tryBlockById(this.block.serviceId, this.block.data.outputId.id);
  }

  get drivingOffset(): boolean {
    return this.target !== null
      && this.target.type === blockTypes.SetpointDriver;
  }

  get suffix(): string {
    return this.outputSetting === null
      ? ''
      : this.drivingOffset
        ? '°C'
        : '%';
  }
}
</script>

<template>
  <g>
    <SvgEmbedded
      :transform="textTransformation([1,1])"
      :width="squares(1)"
      :height="squares(1)"
    >
      <BrokenIcon v-if="isBroken" />
      <UnlinkedIcon v-else-if="!block" />
      <SleepingIcon v-else-if="!block.data.enabled" />
      <template v-else>
        <div class="col row items-center">
          <q-icon v-if="kp === null" name="mdi-calculator-variant" class="col static" size="20px" />
          <q-icon v-else-if="drivingOffset" name="mdi-plus-minus" class="col static" size="20px" />
          <template v-else>
            <HeatingIcon v-if="kp > 0" :stroke="outputValue ? HOT_WATER : 'white'" />
            <CoolingIcon v-if="kp < 0" :stroke="outputValue ? COLD_WATER : 'white'" />
          </template>
        </div>
        <div class="col text-bold">
          {{ outputSetting | truncateRound }}
          <small v-if="!!block">{{ suffix }}</small>
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
