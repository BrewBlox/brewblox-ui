<script lang="ts">
import { Component } from 'vue-property-decorator';

import { SetpointSensorPairBlock } from '../../SetpointSensorPair/types';
import PartComponent from '../components/PartComponent';
import { settingsBlock } from '../helpers';


@Component
export default class SetpointDisplay extends PartComponent {
  get setpoint(): SetpointSensorPairBlock | null {
    return settingsBlock(this.part, 'setpoint');
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
  <g>
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
    <g class="outline">
      <rect
        :width="SQUARE_SIZE*sizeX-2"
        :height="SQUARE_SIZE*sizeY-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
