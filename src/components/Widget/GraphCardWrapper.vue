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
  <q-card v-if="!show" class="passthrough-card column">
    <slot />
  </q-card>
  <q-card v-else dark class="row wrapper-card">
    <slot />
    <template v-if="$q.screen.gt.md">
      <div class="col column justify-center" style="min-height: 100%">
        <q-btn
          v-if="collapsed"
          key="show-button"
          dense
          class="col-auto tab-show q-py-md q-mr-sm bg-dark"
          icon="mdi-chart-line"
          flat
          @click="collapsed = false"
        >
          <q-tooltip>Show Graph</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          key="hide-button"
          colog="primary"
          dense
          class="col-auto tab-hide q-py-md q-ml-sm bg-dark"
          icon="mdi-arrow-collapse-left"
          flat
          @click="collapsed = true"
        >
          <q-tooltip>Hide Graph</q-tooltip>
        </q-btn>
      </div>
      <div v-if="!collapsed" style="width: 600px;">
        <q-card dark class="q-pa-none bg-dark-bright graph-container">
          <slot name="graph" />
        </q-card>
      </div>
    </template>
  </q-card>
</template>

<style scoped>
.passthrough-card {
  padding: 0;
  margin: 0;
}

.wrapper-card {
  padding: 0;
  margin: 0;
  max-width: 95vw;
  background-color: rgba(0, 0, 0, 0);
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
