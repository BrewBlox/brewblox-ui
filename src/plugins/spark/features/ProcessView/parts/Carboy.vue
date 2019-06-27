<script lang="ts">
import { Component } from 'vue-property-decorator';

import { SetpointSensorPairBlock } from '../../SetpointSensorPair/types';
import PartComponent from '../components/PartComponent';
import { settingsBlock } from '../helpers';

@Component
export default class Carboy extends PartComponent {
  get path() {
    return `
    M89.2,199
    H10.8
    c-5.4,0-9.8-4.4-9.8-9.9
    V43.9
    c0-4.4,2.9-8.3,7-9.5
    l32.6-8.8
    V2
    h18.6
    v24.6
    L92,34.4
    c4.2,1.2,7,5.1,7,9.5
    v145.2
    C99,194.6,94.6,199,89.2,199
    z
    `;
  }

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
    <g class="outline">
      <path :d="path"/>
      <SetpointValues :part="part" :start-y="1"/>
    </g>
  </g>
</template>
