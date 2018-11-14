<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { GraphConfig } from '@/components/Graph/state';

@Component({
  props: {
    id: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
  },
})
export default class BlockGraph extends Vue {
  modalOpen: boolean = false;
  placeholder: any = 'testey';

  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  confirmed(func: Function) {
    return (v: any) => { func(v); this.$props.change(this.graphCfg); };
  }
}
</script>

<template>
  <q-card-main class="column col full-height">
    <q-modal maximized v-model="modalOpen">
      <GraphCard v-if="modalOpen" :id="$props.id" :config="graphCfg"/>
    </q-modal>
    <q-field
      dark
      class="col items-center"
      label="Duration"
    >
      <InputPopupEdit
        label="Duration"
        :field="graphCfg.params.duration"
        :change="confirmed(v => graphCfg.params.duration = v)"
      />
    </q-field>
    <q-field
      dark
      class="col"
      inset="label"
    >
      <q-btn
        dense
        color="primary"
        icon="show_chart"
        label="Graph"
        @click="() => modalOpen = true"
      />
    </q-field>
  </q-card-main>
</template>

<style>
</style>
