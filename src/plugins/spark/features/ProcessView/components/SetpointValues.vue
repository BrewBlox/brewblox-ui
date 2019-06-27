<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { SetpointSensorPairBlock } from '../../SetpointSensorPair/types';
import { SQUARE_SIZE } from '../getters';
import { settingsBlock } from '../helpers';
import { PersistentPart } from '../types';

@Component
export default class SetpointValues extends Vue {
  SQUARE_SIZE = SQUARE_SIZE;

  @Prop({ type: Object, required: true })
  public readonly part!: PersistentPart;

  @Prop({ type: String, default: 'setpoint' })
  public readonly settingsKey!: string;

  @Prop({ type: Number, default: 0 })
  public readonly startX!: number;

  @Prop({ type: Number, default: 0 })
  public readonly startY!: number;

  get setpoint(): SetpointSensorPairBlock | null {
    return settingsBlock(this.part, this.settingsKey);
  }

  get setpointSetting(): number | null {
    return this.setpoint
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
}
</script>

<template>
  <g :transform="`translate(${SQUARE_SIZE*startX}, ${SQUARE_SIZE*startY})`">
    <foreignObject :width="SQUARE_SIZE*2" :height="SQUARE_SIZE">
      <div class="text-white text-bold q-ml-md q-mt-xs">
        <q-icon name="mdi-thermometer" class="q-mr-sm"/>
        {{ setpointValue | round(1) }}
        <q-icon v-if="!setpoint" name="mdi-link-variant-off"/>
        <small v-else>{{ setpointUnit }}</small>
        <br>
        <q-icon name="mdi-bullseye-arrow" class="q-mr-sm"/>
        {{ setpointSetting | round(1) }}
        <q-icon v-if="!setpoint" name="mdi-link-variant-off"/>
        <small v-else>{{ setpointUnit }}</small>
      </div>
    </foreignObject>
  </g>
</template>
