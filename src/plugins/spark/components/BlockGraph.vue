<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { durationString } from '@/helpers/functional';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

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
    label: {
      type: String,
      default: '',
    },
  },
})
export default class BlockGraph extends Vue {
  modalOpen: boolean = false;
  prevStrConfig: string = '';

  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  confirmed(func: Function) {
    return (v: any) => { func(v); this.$props.change({ ...this.graphCfg }); };
  }

  parseDuration(val: string): string {
    return durationString(val);
  }

  @Watch('graphCfg', { immediate: true })
  onCfgChange() {
    // Vue considers configuration "changed" with every block data update
    // To avoid constantly refreshing metrics, we need to do a deep compare
    const strConfig = JSON.stringify(this.graphCfg);
    if (strConfig !== this.prevStrConfig) {
      this.prevStrConfig = strConfig;
      this.$nextTick(() => this.$refs.graph && (this.$refs.graph as any).resetMetrics());
    }
  }
}
</script>

<template>
  <span>
    <q-modal v-model="modalOpen" maximized>
      <GraphCard v-if="modalOpen" ref="graph" :id="$props.id" :config="graphCfg"/>
      <q-list class="graph-controls" dark>
        <q-item>
          <q-item-side right>
            <q-btn v-close-overlay rounded color="dark-bright" icon="close" label="close"/>
          </q-item-side>
        </q-item>
        <q-item>
          <q-item-side right>
            <q-field label="Duration">
              <InputPopupEdit
                :field="graphCfg.params.duration"
                :change="confirmed(v => $set(graphCfg.params, 'duration', parseDuration(v)))"
                label="Duration"
                display="span"
              />
            </q-field>
          </q-item-side>
        </q-item>
      </q-list>
    </q-modal>
    <q-btn
      :label="$props.label"
      flat
      round
      dense
      icon="mdi-chart-line"
      @click="() => modalOpen = true"
    />
  </span>
</template>

<style scoped lang="stylus">
.graph-controls {
  background-color: black;
  opacity: 1;
  position: absolute;
  top: 10%;
  right: 0px;
}

.q-list {
  border: 1px solid gray;
  border-right: 0px;
}

/deep/ .graph-controls .q-field * {
  align-items: center;
  margin-top: 0px !important;
}
</style>
