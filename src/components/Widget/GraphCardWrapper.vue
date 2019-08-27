<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class GraphCardWrapper extends Vue {
  collapsed = true;
  sizeok = false;

  @Prop({ type: Boolean, default: false })
  public readonly showInitial!: boolean;

  created(): void {
    this.collapsed = !this.showInitial;
  }
}
</script>

<template>
  <q-card dark class="row wrapper-card">
    <slot />
    <div v-if="sizeok" class="col column justify-center" style="min-height: 100%">
      <q-btn
        v-if="collapsed"
        key="show-button"
        dense
        class="col-auto tab-show q-py-md q-mr-sm"
        icon="mdi-chart-line"
        flat
        @click="collapsed = false"
      >
        <q-tooltip>Show Graph</q-tooltip>
      </q-btn>
      <q-btn
        v-else
        key="hide-button"
        dense
        class="col-auto tab-hide q-py-md q-ml-sm"
        icon="mdi-arrow-collapse-left"
        flat
        @click="collapsed = true"
      >
        <q-tooltip>Hide Graph</q-tooltip>
      </q-btn>
    </div>
    <ScreenSizeConstrained
      v-show="!collapsed"
      :min-width="1500"
      style="width: 600px;"
      @sizeok="v => sizeok = v"
    >
      <q-card v-if="!collapsed" dark class="q-pa-xs bg-dark-bright">
        <slot name="graph" />
      </q-card>
    </ScreenSizeConstrained>
  </q-card>
</template>

<style scoped>
.wrapper-card {
  padding: 0;
  margin: 0;
  max-width: 95vw;
  background-color: rgba(0, 0, 0, 0);
}

.tab-show {
  border: 1px solid gray;
  border-left: 0;
}

.tab-hide {
  border: 1px solid gray;
  border-right: 0;
}
</style>
