<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class GraphCardWrapper extends Vue {
  collapsed = true;

  @Prop({ type: Boolean, default: false })
  public readonly show!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly showInitial!: boolean;

  created(): void {
    this.collapsed = !this.showInitial;
  }
}
</script>

<template>
  <div v-if="show && $q.screen.gt.md" class="row no-wrap justify-center combined-wrapper">
    <CardWrapper class="col-5 bg-dark" v-bind="$attrs">
      <template #toolbar>
        <slot name="toolbar" />
      </template>
      <slot />
    </CardWrapper>
    <div class="col-auto tab-line self-center z-top" />
    <q-btn
      flat
      dense
      class="col-auto graph-tab show q-py-md q-mr-sm bg-dark"
      :icon="collapsed ? 'mdi-chart-line' : 'mdi-arrow-collapse-left'"
      @click="collapsed = !collapsed"
    >
      <q-tooltip>{{ collapsed ? 'Show Graph' : 'Hide Graph' }}</q-tooltip>
    </q-btn>
    <div v-if="!collapsed" class="col-5 bg-dark">
      <div class="graph-container">
        <slot name="graph" />
      </div>
    </div>
  </div>
  <CardWrapper v-else v-bind="$attrs">
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <slot />
  </CardWrapper>
</template>

<style lang="sass" scoped>
.combined-wrapper
  height: 800px
  max-height: 90vh
  width: 90vw
  min-width: 90vw

.tab-line
  background-color: $indigo-4
  opacity: 0.8
  width: 2px
  height: 25%

.graph-tab
  margin-left: -1px
  border: 2px solid $indigo-4
  border-left: 0
  background-color: rgba(255, 255, 255, 0.2)

.graph-container
  height: calc(100% - 4px)
  width: calc(100% - 4px)
  border: 2px solid gray
  border-radius: 2px

</style>
