<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { partSettings } from '@/plugins/spark/features/ProcessView/calculateFlows';
import { FlowPart } from '@/plugins/spark/features/ProcessView/state';
import { SQUARE_SIZE } from './getters';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class ProcessViewForm extends Vue {
  get part(): FlowPart {
    return this.$props.value;
  }

  get cards() {
    return [
      'PlacementPartCard',
      ...partSettings(this.part).cards,
    ];
  }

  get gridStyle() {
    return {
      width: `${SQUARE_SIZE * 2}px`,
      height: `${SQUARE_SIZE * 2}px`,
    };
  }

  get itemStyle() {
    return {
      width: `${SQUARE_SIZE}px`,
      height: `${SQUARE_SIZE}px`,
      position: 'relative',
      transform: 'scale(2,2)',
    };
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar class="unpadded">
      <q-toolbar-title>{{ part.type }} {{ part.x }},{{ part.y }}</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-card>
      <q-card-main class="row justify-center">
        <svg :style="gridStyle">
          <g :style="itemStyle">
            <ProcessViewItem :value="part"/>
          </g>
        </svg>
      </q-card-main>
    </q-card>
    <component v-for="card in cards" :key="card" :is="card" :value="part" v-on="$listeners"/>
  </div>
</template>

<style scoped>
.q-card {
  width: 100%;
  margin-bottom: 10px;
}
</style>
