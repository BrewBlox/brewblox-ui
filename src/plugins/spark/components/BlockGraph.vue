<script lang="ts">
import { Dialog } from 'quasar';
import Vue from 'vue';
import { Component, Emit, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { targetSplitter } from '@/components/Graph/functional';
import { defaultPresets } from '@/components/Graph/getters';
import HistoryGraph from '@/components/Graph/HistoryGraph.vue';
import { GraphConfig } from '@/components/Graph/types';
import { durationString } from '@/helpers/functional';
import { QueryParams } from '@/store/history';

@Component
export default class BlockGraph extends Vue {
  durationString = durationString;

  configString = '';

  @Ref()
  readonly graph!: HistoryGraph;

  @Prop({ type: Boolean, required: true })
  readonly value!: boolean;

  @Prop({ type: String, required: true })
  readonly id!: string;

  @Prop({ type: Object, required: true })
  readonly config!: Partial<GraphConfig>;

  @Prop({ type: Boolean, default: false })
  readonly noDuration!: boolean;

  @Emit('update:config')
  change(cfg: GraphConfig = this.graphCfg): GraphConfig {
    return cfg;
  }

  get dialogOpen() {
    return this.value;
  }

  set dialogOpen(val: boolean) {
    this.$emit('input', val);
  }

  get graphCfg(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      axes: {},
      colors: {},
      ...this.config,
    };
  }

  get targetKeys() {
    return targetSplitter(this.graphCfg.targets)
      .map(key => [key, this.graphCfg.renames[key] || key]);
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isRightAxis(key: string) {
    return this.graphCfg.axes[key] === 'y2';
  }

  axisLabel(key: string) {
    return this.isRightAxis(key) ? 'Y2' : 'Y1';
  }

  updateKeySide(key: string, isRight: boolean) {
    this.change({
      ...this.graphCfg,
      axes: {
        ...this.graphCfg.axes,
        [key]: isRight ? 'y2' : 'y',
      },
    });
  }

  applyPreset(preset: QueryParams) {
    this.change({
      ...this.graphCfg,
      params: { ...preset },
    });
  }

  updateDuration() {
    Dialog.create({
      component: 'InputDialog',
      title: 'Duration',
      root: this.$root,
      value: this.graphCfg.params.duration,
    })
      .onOk(val => {
        this.graphCfg.params.duration = durationString(val);
        this.change(this.graphCfg);
      });
  }

  @Watch('graphCfg')
  onCfgChange(newVal) {
    // Vue considers configuration "changed" with every block data update
    // To avoid constantly refreshing listeners, we need to do a deep compare
    if (JSON.stringify(newVal) !== this.configString) {
      this.configString = JSON.stringify(newVal);
      this.$nextTick(() => this.graph && this.graph.resetListeners());
    }
  }

  created() {
    this.configString = JSON.stringify(this.graphCfg);
  }
}
</script>

<template>
  <q-dialog v-model="dialogOpen" maximized>
    <q-card v-if="dialogOpen" class="text-white bg-dark-bright" dark>
      <HistoryGraph :id="id" ref="graph" :config="graphCfg">
        <template v-slot:controls>
          <q-btn-dropdown v-if="!noDuration" auto-close flat label="timespan" icon="mdi-timelapse">
            <q-item
              v-for="(preset, idx) in presets"
              :key="idx"
              :active="preset.duration === graphCfg.params.duration"
              dark
              link
              clickable
              @click="applyPreset(preset)"
            >
              <q-item-section>{{ preset.duration }}</q-item-section>
            </q-item>
          </q-btn-dropdown>
          <q-btn-dropdown flat label="settings" icon="settings">
            <q-item dark link clickable @click="updateDuration">
              <q-item-section>Duration</q-item-section>
              <q-item-section class="col-auto">
                {{ durationString(graphCfg.params.duration) }}
              </q-item-section>
            </q-item>
            <q-expansion-item label="Display Axis">
              <q-item
                v-for="[key, renamed] in targetKeys"
                :key="key"
                dark
                link
                clickable
                @click="updateKeySide(key, !isRightAxis(key))"
              >
                <q-item-section>{{ renamed }}</q-item-section>
                <q-item-section side>
                  {{ axisLabel(key) }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </q-btn-dropdown>
          <q-btn v-close-popup flat label="close" />
        </template>
      </HistoryGraph>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="stylus">
.mirrored {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
