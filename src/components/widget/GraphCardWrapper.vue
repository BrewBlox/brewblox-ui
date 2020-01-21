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
  <div v-if="!show || !$q.screen.gt.md" class="passthrough-card column">
    <slot />
  </div>
  <div v-else class="row wrapper-card" style="min-height: 80vh">
    <div class="col-auto column passtrough-card">
      <slot />
    </div>
    <div class="col-auto column justify-center" style="min-height: 100%">
      <q-btn
        v-if="collapsed"
        key="show-button"
        flat
        dense
        class="col-auto tab-show q-py-md q-mr-sm"
        icon="mdi-chart-line"
        @click="collapsed = false"
      >
        <q-tooltip>Show Graph</q-tooltip>
      </q-btn>
      <q-btn
        v-else
        key="hide-button"
        flat
        dense
        class="col-auto tab-hide q-py-md q-ml-sm"
        icon="mdi-arrow-collapse-left"
        @click="collapsed = true"
      >
        <q-tooltip>Hide Graph</q-tooltip>
      </q-btn>
    </div>
    <div v-if="!collapsed" style="width: 40vw">
      <q-card class="q-pa-none graph-container">
        <slot name="graph" />
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.passthrough-card {
  padding: 0;
  margin: 0;
  max-width: 100%;
  min-height: 100%;
}

.wrapper-card {
  padding: 0;
  margin: 0;
  max-width: 100vw;
  /* background-color: rgba(0, 0, 0, 0); */
}

.tab-show {
  border: 2px solid white;
  border-left: 0;
}

.tab-hide {
  border: 2px solid white;
  border-right: 0;
}

.graph-container {
  height: calc(100% - 4px);
  width: calc(100% - 4px);
  border: 2px solid gray;
}
</style>
