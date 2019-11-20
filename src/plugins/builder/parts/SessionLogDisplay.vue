<script lang="ts">
import { Component } from 'vue-property-decorator';

import { dashboardStore } from '@/store/dashboards';

import PartBase from '../components/PartBase';

@Component
export default class SessionLogDisplay extends PartBase {
  get isLinked(): boolean {
    return !!this.settings.widgetId;
  }

  get isBroken(): boolean {
    return this.isLinked
      && !dashboardStore.widgetIds.includes(this.settings.widgetId);
  }
}
</script>

<template>
  <g>
    <foreignObject :transform="textTransformation([sizeX, sizeY])" :width="squares(sizeX)" :height="squares(sizeY)">
      <q-icon v-if="isBroken" name="mdi-alert-circle-outline" color="negative" size="lg" class="maximized" />
      <q-icon v-else name="mdi-text-subject" size="lg" class="maximized" />
    </foreignObject>
    <g class="outline">
      <rect
        :width="squares(sizeX)-2"
        :height="squares(sizeY)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
      <line
        v-if="!isLinked"
        :transform="textTransformation([sizeX, sizeY])"
        x1="10"
        y1="10"
        :x2="squares(sizeX)-10"
        :y2="squares(sizeY)-10"
      />
    </g>
  </g>
</template>
