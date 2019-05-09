<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import sparkStore from '@/plugins/spark/store';
import { Link } from '@/helpers/units';
import get from 'lodash/get';


@Component
export default class SensorDisplay extends PartComponent {
  get sensorServiceId(): string {
    return this.part.settings.sensorServiceId;
  }

  get sensorLink(): Link {
    return this.part.settings.sensorLink;
  }

  get temperature(): number | null {
    if (!this.sensorServiceId || !this.sensorLink || !this.sensorLink.id) {
      return null;
    }
    return get(
      sparkStore.blocks(this.sensorServiceId),
      [this.sensorLink.id, 'data', 'value', 'val'],
      null
    );
  }
}
</script>

<template>
  <g class="sensor-display">
    <foreignObject
      :transform="textTransformation([1,1])"
      :width="SQUARE_SIZE"
      :height="SQUARE_SIZE"
    >
      <div class="text-white text-bold text-center">
        <q-icon name="mdi-thermometer"/>
        <q-icon v-if="!sensorLink" name="mdi-link-variant-off"/>
        <br>
        {{ temperature | round(1) }}
      </div>
    </foreignObject>
    <g class="outline">
      <rect
        :width="SQUARE_SIZE-2"
        :height="SQUARE_SIZE-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
