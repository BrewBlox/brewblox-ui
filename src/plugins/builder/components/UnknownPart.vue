<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class UnknownPart extends PartBase { }
</script>

<template>
  <g>
    <g class="outline">
      <foreignObject
        :transform="textTransformation([sizeX, sizeY], false)"
        :width="squares(sizeX)"
        :height="squares(sizeY)"
      >
        <div
          class="text-white text-bold text-center text-h3 q-mt-xs"
          style="max-width: 100%;"
        >
          ?
        </div>
      </foreignObject>
    </g>
  </g>
</template>
