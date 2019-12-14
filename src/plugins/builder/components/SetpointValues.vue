<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { contrastColor } from '@/helpers/functional';
import { SetpointSensorPairBlock } from '@/plugins/spark/features/SetpointSensorPair/types';
import { sparkStore } from '@/plugins/spark/store';

import { blockTypes } from '../../spark/block-types';
import { SQUARE_SIZE } from '../getters';
import { settingsBlock, settingsLink } from '../helpers';
import { PersistentPart } from '../types';

@Component
export default class SetpointValues extends Vue {

  @Prop({ type: Object, required: true })
  public readonly part!: PersistentPart;

  @Prop({ type: String, default: 'setpoint' })
  public readonly settingsKey!: string;

  @Prop({ type: Number, default: 0 })
  public readonly startX!: number;

  @Prop({ type: Number, default: 0 })
  public readonly startY!: number;

  @Prop({ type: Boolean, default: false })
  public readonly hideUnset!: boolean;

  @Prop({ type: String })
  public readonly backgroundColor!: string;

  get textColor(): string {
    return this.backgroundColor
      ? contrastColor(this.backgroundColor)
      : 'white';
  }

  get block(): SetpointSensorPairBlock | null {
    return settingsBlock(this.part, this.settingsKey);
  }

  get isUsed(): boolean {
    return !!this.block
      && this.block.data.settingEnabled
      && sparkStore.blockValues(this.block.serviceId)
        .some(block =>
          block.type === blockTypes.Pid
          && block.data.inputId.id === (this.block as SetpointSensorPairBlock).id);
  }

  get isDriven(): boolean {
    return !!this.block
      && sparkStore.drivenChains(this.block.serviceId)
        .some(chain => chain[0] === (this.block as SetpointSensorPairBlock).id);
  }

  get isBroken(): boolean {
    if (this.block) {
      return false;
    }
    const link = settingsLink(this.part, this.settingsKey);
    return !!link.serviceId && !!link.blockId;
  }

  get setpointSetting(): number | null {
    return this.block && this.isUsed
      ? this.block.data.storedSetting.value
      : null;
  }

  get setpointValue(): number | null {
    return this.block
      ? this.block.data.value.value
      : null;
  }

  get setpointUnit(): string {
    return this.block
      ? this.block.data.storedSetting.notation
      : '';
  }

  public squares(val: number): number {
    return SQUARE_SIZE * val;
  }
}
</script>

<template>
  <g v-if="block || !hideUnset" :transform="`translate(${squares(startX)}, ${squares(startY)})`">
    <foreignObject :width="squares(2)" :height="squares(1)">
      <q-icon v-if="isBroken" name="mdi-alert-circle-outline" color="negative" size="lg" class="maximized" />
      <q-icon v-else-if="!block" name="mdi-link-variant-off" color="warning" size="md" class="maximized" />
      <div v-else :class="[`text-${textColor}`, 'text-bold', 'q-ml-md', 'q-mt-xs']">
        <q-icon name="mdi-thermometer" class="q-mr-sm" />
        {{ setpointValue | round(1) }}
        <small>{{ setpointUnit }}</small>
        <br />
        <q-icon :name="isDriven ? 'mdi-swap-vertical-bold' : 'mdi-bullseye-arrow'" class="q-mr-sm" />
        {{ setpointSetting | round(1) }}
        <small>{{ setpointUnit }}</small>
      </div>
    </foreignObject>
  </g>
</template>
