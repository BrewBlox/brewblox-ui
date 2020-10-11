<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class ActionSubmenu extends Vue {

  @Prop({ type: String, required: true })
  public readonly label!: string;
}
</script>

<template>
  <div class="col-auto column no-wrap">
    <div
      class="col-auto q-py-sm q-px-md text-italic text-grey-5"
      style="font-size: 120%"
    >
      {{ label }}
    </div>
    <slot />
  </div>
</template>
