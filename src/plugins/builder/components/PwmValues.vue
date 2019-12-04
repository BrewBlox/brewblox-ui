<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { ActuatorPwmBlock } from '@/plugins/spark/block-types';

import { settingsBlock, settingsLink, squares, textTransformation } from '../helpers';
import { PersistentPart } from '../types';


@Component
export default class PwmValues extends Vue {
  squares = squares;

  @Prop({ type: Object, required: true })
  public readonly part!: PersistentPart;

  @Prop({ type: String, default: 'pwm' })
  public readonly settingsKey!: string;

  @Prop({ type: Boolean, default: false })
  public readonly noBorder!: boolean;

  @Prop({ type: Number, default: 0 })
  public readonly startX!: number;

  @Prop({ type: Number, default: 0 })
  public readonly startY!: number;

  get block(): ActuatorPwmBlock | null {
    return settingsBlock(this.part, this.settingsKey);
  }

  get isBroken(): boolean {
    if (this.block) {
      return false;
    }
    const link = settingsLink(this.part, this.settingsKey);
    return !!link.serviceId && !!link.blockId;
  }

  get pwmValue(): number | null {
    return this.block && this.block.data.enabled
      ? this.block.data.value
      : null;
  }

  get transform(): string {
    return textTransformation(this.part, [1, 1]);
  }
}
</script>

<template>
  <g>
    <foreignObject
      :x="squares(startX)"
      :y="squares(startY)"
      :transform="transform"
      :width="squares(1)"
      :height="squares(1)"
    >
      <q-icon v-if="isBroken" name="mdi-alert-circle-outline" color="negative" size="lg" class="maximized" />
      <q-icon v-else-if="block && !block.data.enabled" name="mdi-sleep" size="lg" class="maximized" color="warning" />
      <div v-else class="text-white text-bold text-center">
        <q-icon name="mdi-gauge" />
        <q-icon v-if="!block" name="mdi-link-variant-off" class="q-ml-xs" />
        <br />
        {{ pwmValue | truncateRound }}<small v-if="!!block" style="margin-left: 2px">%</small>
      </div>
    </foreignObject>
    <rect
      v-if="!noBorder"
      class="outline"
      :width="squares(1)-2"
      :height="squares(1)-2"
      :x="squares(startX)+1"
      :y="squares(startY)+1"
      rx="6"
      ry="6"
      stroke-width="2px"
    />
  </g>
</template>
