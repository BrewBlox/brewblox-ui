<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { durationString } from '@/helpers/functional';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { targetSplitter } from '@/components/Graph/functional';

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
    noDuration: {
      type: Boolean,
      default: false,
    },
    buttonSize: {
      type: String,
      default: 'md',
    },
  },
})
export default class BlockGraph extends Vue {
  modalOpen: boolean = false;
  prevStrConfig: string = '';

  get graphCfg(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      axes: {},
      ...this.$props.config,
    };
  }

  get targetKeys() {
    return targetSplitter(this.graphCfg.targets)
      .map(key => [key, this.graphCfg.renames[key] || key]);
  }

  confirmed(func: Function) {
    return (v: any) => { func(v); this.$props.change({ ...this.graphCfg }); };
  }

  updateKeySide(key: string, isRight: boolean) {
    this.$props.change({
      ...this.graphCfg,
      axes: {
        ...this.graphCfg.axes,
        [key]: isRight ? 'y2' : 'y',
      },
    });
  }

  parseDuration(val: string): string {
    return durationString(val);
  }

  @Watch('graphCfg')
  onCfgChange() {
    // Vue considers configuration "changed" with every block data update
    // To avoid constantly refreshing metrics, we need to do a deep compare
    const strConfig = JSON.stringify(this.graphCfg);
    if (strConfig !== this.prevStrConfig) {
      this.prevStrConfig = strConfig;
      this.$nextTick(() => this.$refs.graph && (this.$refs.graph as any).resetMetrics());
    }
  }

  mounted() {
    this.prevStrConfig = JSON.stringify(this.graphCfg);
  }
}
</script>

<template>
  <span>
    <q-modal v-model="modalOpen" maximized>
      <GraphCard v-if="modalOpen" ref="graph" :id="$props.id" :config="graphCfg"/>
      <div class="row graph-controls z-top">
        <q-btn-dropdown flat label="settings">
          <q-list link>
            <q-item @click.native="() => $refs.duration.$el.click()">
              <q-item-side>Duration</q-item-side>
              <q-item-main>
                <InputPopupEdit
                  ref="duration"
                  :field="graphCfg.params.duration"
                  :change="confirmed(v => $set(graphCfg.params, 'duration', parseDuration(v)))"
                  label="Duration"
                  display="span"
                />
              </q-item-main>
            </q-item>
            <q-collapsible label="Display Side">
              <q-item v-for="[key, renamed] in targetKeys" :key="key">
                <q-item-side>
                  <q-toggle
                    :value="graphCfg.axes[key] === 'y2'"
                    @input="v => updateKeySide(key, v)"
                  />
                </q-item-side>
                <q-item-main>{{ renamed }}</q-item-main>
              </q-item>
            </q-collapsible>
          </q-list>
        </q-btn-dropdown>
        <q-btn v-close-overlay flat label="close"/>
      </div>
    </q-modal>
    <q-btn
      :label="$props.label"
      :size="$props.buttonSize"
      flat
      rounded
      dense
      icon="mdi-chart-line"
      @click="() => modalOpen = true"
    />
  </span>
</template>

<style scoped lang="stylus">
.graph-controls {
  position: absolute;
  top: 10px;
  right: 10px;
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
