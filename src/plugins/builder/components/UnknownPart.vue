<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class UnknownPart extends PartBase { }
</script>

<template>
  <g>
    <SvgEmbedded
      :transform="textTransformation([sizeX, sizeY], false)"
      :width="squares(sizeX)"
      :height="squares(sizeY)"
    >
      <div class="col text-bold text-h3 q-mt-xs">
        ?
      </div>
    </SvgEmbedded>
  </g>
</template>
