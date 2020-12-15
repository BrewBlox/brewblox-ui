<script lang="ts">
import { mdiCalculatorVariant, mdiPlusMinus } from '@quasar/extras/mdi-v5';
import { Component } from 'vue-property-decorator';

import { bloxQty, prettyUnit } from '@/helpers/bloxfield';
import { serviceTemp } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockType, PidBlock } from '@/plugins/spark/types';
import { BlockAddress } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { CENTER, COLD_WATER, HOT_WATER } from '../getters';
import { settingsAddress } from '../helpers';


@Component
export default class PidDisplay extends PartBase {
  icons: Mapped<string> = {};
  HOT_WATER = HOT_WATER;
  COLD_WATER = COLD_WATER;
  readonly addressKey = 'pid';
  readonly scaleKey = 'scale';

  created(): void {
    this.icons.mdiCalculatorVariant = mdiCalculatorVariant;
    this.icons.mdiPlusMinus = mdiPlusMinus;
  }

  get scale(): number {
    return this.settings[this.scaleKey] ?? 1;
  }

  get address(): BlockAddress {
    return settingsAddress(this.part, this.addressKey);
  }

  get block(): PidBlock | null {
    const { serviceId, id } = this.address;
    return sparkStore.blockById(serviceId, id);
  }

  get isBroken(): boolean {
    return this.block == null
      && this.address.id !== null;
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
    return this.block
      ? sparkStore.blockById(this.block.serviceId, this.block.data.outputId.id)
      : null;
  }

  get drivingOffset(): boolean {
    return this.target !== null
      && this.target.type === BlockType.ActuatorOffset;
  }

  get tempUnit(): 'delta_degC' | 'delta_degF' {
    return this.block !== null
      && serviceTemp(this.block.serviceId) === 'degF'
      ? 'delta_degF'
      : 'delta_degC';
  }

  get convertedOutputSetting(): number | null {
    return this.drivingOffset
      && this.block !== null
      ? bloxQty(this.outputSetting, 'delta_degC').to(this.tempUnit).value
      : this.outputSetting;
  }

  get suffix(): string {
    return this.outputSetting === null
      ? ''
      : this.drivingOffset
        ? prettyUnit(this.tempUnit)
        : '%';
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
      <SleepingIcon v-else-if="!block.data.enabled" class="col" />
      <template v-else>
        <q-icon
          v-if="kp === null"
          :name="icons.mdiCalculatorVariant"
          class="col-auto static"
          size="25px"
        />
        <q-icon
          v-else-if="drivingOffset"
          :name="icons.mdiPlusMinus"
          class="col-auto static"
          size="25px"
        />
        <template v-else>
          <HeatingIcon
            v-if="kp > 0"
            :color="outputValue ? HOT_WATER : 'white'"
          />
          <CoolingIcon
            v-if="kp < 0"
            :color="outputValue ? COLD_WATER : 'white'"
          />
        </template>
        <div class="col text-bold">
          {{ convertedOutputSetting | truncateRound }}
          <small v-if="!!block">{{ suffix }}</small>
        </div>
      </template>
    </SvgEmbedded>
    <g class="outline">
      <rect
        :width="squares(1)-2"
        :height="squares(1)-2"
        :stroke="color"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
