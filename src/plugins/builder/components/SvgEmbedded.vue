<script lang="ts">

import { computed, defineComponent } from 'vue';


@Component
export default class SvgEmbedded extends Vue {

  @Prop({ type: [String, Array, Object], default: 'fit column items-center' })
  public readonly contentClass!: any;

}
</script>

<template>
  <foreignObject v-bind="$attrs">
    <div :class="contentClass" style="position: static">
      <slot />
    </div>
  </foreignObject>
</template>

<style lang="sass">
.embedded-wrapper .q-icon
  position: static !important
  font-size: medium
</style>
