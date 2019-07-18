<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { contrastColor } from '@/helpers/functional';
import { typeName as pidType } from '@/plugins/spark/features/Pid/getters';
import { SetpointSensorPairBlock } from '@/plugins/spark/features/SetpointSensorPair/types';
import { sparkStore } from '@/plugins/spark/store';

import { SQUARE_SIZE } from '../getters';
import { settingsBlock } from '../helpers';
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

  get textColor() {
    return this.backgroundColor
      ? contrastColor(this.backgroundColor)
      : 'white';
  }

  get setpoint(): SetpointSensorPairBlock | null {
    return settingsBlock(this.part, this.settingsKey);
  }

  get isUsed(): boolean {
    return !!this.setpoint
      && this.setpoint.data.settingEnabled
      && sparkStore.blockValues(this.setpoint.serviceId)
        .some(block =>
          block.type === pidType
          && block.data.inputId.id === (this.setpoint as SetpointSensorPairBlock).id);
  }

  get setpointSetting(): number | null {
    return this.setpoint && this.isUsed
      ? this.setpoint.data.storedSetting.value
      : null;
  }

  get setpointValue(): number | null {
    return this.setpoint
      ? this.setpoint.data.value.value
      : null;
  }

  get setpointUnit(): string {
    return this.setpoint
      ? this.setpoint.data.storedSetting.notation
      : '';
  }

  public squares(val: number): number {
    return SQUARE_SIZE * val;
  }
}
</script>

<template>
  <g v-if="setpoint || !hideUnset" :transform="`translate(${squares(startX)}, ${squares(startY)})`">
    <foreignObject :width="squares(2)" :height="squares(1)">
      <div :class="[`text-${textColor}`, 'text-bold', 'q-ml-md', 'q-mt-xs']">
        <q-icon name="mdi-thermometer" class="q-mr-sm" />
        {{ setpointValue | round(1) }}
        <q-icon v-if="!setpoint" name="mdi-link-variant-off" />
        <small v-else>{{ setpointUnit }}</small>
        <br />
        <q-icon name="mdi-bullseye-arrow" class="q-mr-sm" />
        {{ setpointSetting | round(1) }}
        <q-icon v-if="!setpoint" name="mdi-link-variant-off" />
        <small v-else>{{ setpointUnit }}</small>
      </div>
    </foreignObject>
  </g>
</template>
