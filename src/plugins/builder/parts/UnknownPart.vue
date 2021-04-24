<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'UnknownPart',
});
// @Component
// export default class UnknownPart extends PartBase { }
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
