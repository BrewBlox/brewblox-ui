<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { durationString } from '@/helpers/functional';
import Vue from 'vue';
import Component from 'vue-class-component';

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

  parseDuration(val: string): string {
    return durationString(val);
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen" maximized>
      <GraphCard v-if="modalOpen" :id="$props.id" :config="graphCfg"/>
      <q-btn
        v-close-overlay
        rounded
        label="close"
        icon="close"
        style="position: absolute; right: 18px; top: 18px"
      />
      <q-field label="Duration" class="col-8">
        <InputPopupEdit
          :field="graphCfg.params.duration"
          :change="confirmed(v => graphCfg.params.duration = parseDuration(v))"
          label="Duration"
        />
      </q-field>
    </q-modal>
    <div class="row">
      <q-btn dense color="primary" icon="show_chart" label="Graph" align="right" @click="() => modalOpen = true"/>
    </div>
  </div>
</template>

<style>
</style>
