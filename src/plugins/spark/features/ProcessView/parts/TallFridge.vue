<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ActuatorPwmBlock } from '../../ActuatorPwm/types';
import { SetpointSensorPairBlock } from '../../SetpointSensorPair/types';
import PartComponent from '../components/PartComponent';
import { COLD_WATER, HOT_WATER } from '../getters';
import { settingsBlock } from '../helpers';


@Component
export default class TallFridge extends PartComponent {
  HOT_WATER = HOT_WATER;
  COLD_WATER = COLD_WATER;

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
        :width="SQUARE_SIZE*sizeX-4"
        :height="SQUARE_SIZE*sizeY-4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
      <line :x1="2" :y1="SQUARE_SIZE" :x2="SQUARE_SIZE*sizeX-4" :y2="SQUARE_SIZE"/>
      <line
        :x1="2"
        :y1="SQUARE_SIZE*(sizeY-1)"
        :x2="SQUARE_SIZE*sizeX-4"
        :y2="SQUARE_SIZE*(sizeY-1)"
        stroke-width="4px"
      />
      <line
        :x1="SQUARE_SIZE*(sizeX/2)"
        :y1="SQUARE_SIZE*(sizeY-1)"
        :x2="SQUARE_SIZE*(sizeX/2)"
        :y2="SQUARE_SIZE*sizeY-4"
      />
      <SetpointValues :part="part" :start-y="sizeY-1"/>
      <g
        :transform="`translate(
        ${SQUARE_SIZE*(sizeX/2)},
        ${SQUARE_SIZE*(sizeY-1)})`"
      >
        <CoolingIcon :stroke="COLD_WATER" x="5" y="2"/>
        <HeatingIcon :stroke="HOT_WATER" x="5" y="22"/>
        <foreignObject :width="SQUARE_SIZE*2" :height="SQUARE_SIZE">
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
