<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class BrokenIcon extends Vue {
  @Prop({ type: String, default: 'lg' })
  public readonly size!: string;
}
</script>

<template>
  <q-icon
    name="mdi-alert-circle-outline"
    color="negative"
    :size="size"
    class="col static"
  />
</template>
