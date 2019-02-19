<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { partSettings } from '@/plugins/spark/features/ProcessView/calculateFlows';
import { FlowPart } from '@/plugins/spark/features/ProcessView/state';

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
}
</script>

<template>
  <div class="widget-modal">
    <q-btn
      v-close-overlay
      v-if="!$props.embedded"
      rounded
      label="close"
      icon="close"
      style="position: absolute; right: 18px; top: 18px"
    />
    <component v-for="card in cards" :key="card" :is="card" :value="part" v-on="$listeners"/>
  </div>
</template>

<style scoped>
.q-card {
  width: 100%;
  margin-bottom: 10px;
}
</style>
