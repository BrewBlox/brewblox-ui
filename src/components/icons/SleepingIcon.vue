<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class SleepingIcon extends Vue {
  @Prop({ type: String, default: '40px' })
  public readonly size!: string;
}
</script>

<template>
  <q-icon
    name="mdi-sleep"
    color="warning"
    :size="size"
    class="static"
  />
</template>
