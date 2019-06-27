<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ActuatorPwmBlock } from '../../ActuatorPwm/types';
import PartComponent from '../components/PartComponent';
import { COLD_WATER, HOT_WATER } from '../getters';
import { settingsBlock } from '../helpers';


@Component
export default class TallFridge extends PartComponent {
  HOT_WATER = HOT_WATER;
  COLD_WATER = COLD_WATER;

  get titleText(): string {
    return this.part.settings.text || '';
  }

  get coolPwm(): ActuatorPwmBlock | null {
    return settingsBlock(this.part, 'coolPwm');
  }

  get coolSetting(): number | null {
    return this.coolPwm
      ? this.coolPwm.data.desiredSetting
      : null;
  }

  get heatPwm(): ActuatorPwmBlock | null {
    return settingsBlock(this.part, 'heatPwm');
  }

  get heatSetting(): number | null {
    return this.heatPwm
      ? this.heatPwm.data.desiredSetting
      : null;
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <rect
        :width="squares(sizeX)-4"
        :height="squares(sizeY)-4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
      <line :x1="2" :y1="squares(1)" :x2="squares(sizeX)-4" :y2="squares(1)"/>
      <line
        :x1="2"
        :y1="squares(sizeY-1)"
        :x2="squares(sizeX)-4"
        :y2="squares(sizeY-1)"
        stroke-width="4px"
      />
      <!-- Bottom divider -->
      <line
        :x1="squares(sizeX-2)"
        :y1="squares(sizeY-1)"
        :x2="squares(sizeX-2)"
        :y2="squares(sizeY)-4"
      />
      <!-- Shelf -->
      <line
        v-if="sizeY >= 10"
        :x1="2"
        :y1="squares(sizeY/2)"
        :x2="squares(sizeX)-4"
        :y2="squares(sizeY/2)"
        stroke-width="4px"
      />
      <g>
        <foreignObject :width="squares(sizeX)" :height="squares(1)">
          <div class="text-white text-bold text-h6 q-mt-xs q-ml-sm">{{ titleText }}</div>
        </foreignObject>
      </g>
      <g :transform="`translate(${squares(sizeX-2)}, ${squares(sizeY-1)})`">
        <CoolingIcon :stroke="COLD_WATER" x="5" y="2"/>
        <HeatingIcon :stroke="HOT_WATER" x="5" y="22"/>
        <foreignObject :width="squares(2)" :height="squares(1)">
          <div class="text-white text-bold text-center q-mt-xs">
            {{ coolSetting | round(0) }}
            <q-icon v-if="!coolPwm" name="mdi-link-variant-off"/>
            <small v-else>%</small>
            <br>
            {{ heatSetting | round(0) }}
            <q-icon v-if="!heatPwm" name="mdi-link-variant-off"/>
            <small v-else>%</small>
          </div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
