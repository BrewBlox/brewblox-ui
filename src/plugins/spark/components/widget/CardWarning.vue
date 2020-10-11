<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class CardWarning extends Vue {
  @Prop({ type: String, default: 'warning' })
  readonly icon!: string;

  @Prop({ type: String, default: 'warning' })
  readonly color!: string;
}
</script>

<template>
  <div
    class="row no-wrap items-center q-gutter-x-md q-ma-md justify-center"
    style="max-width: 100%"
  >
    <q-icon
      :name="icon"
      :color="color"
      size="md"
      class="col-auto"
    />
    <div class="col-shrink">
      <slot name="message" />
    </div>
    <div class="col-auto column q-gutter-y-xs">
      <slot name="actions" />
    </div>
  </div>
</template>
