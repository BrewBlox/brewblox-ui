<script lang="ts">
import { Layout } from 'plotly.js';
import Vue from 'vue';
import { Component, Emit, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { bloxQty } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { durationString } from '@/helpers/duration';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/getters';
import { targetSplitter } from '@/plugins/history/nodes';
import { GraphConfig, QueryParams } from '@/plugins/history/types';

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

  @Watch('graphCfg')
  onCfgChange(newVal): void {
    // Vue considers configuration "changed" with every block data update
    // To avoid constantly refreshing sources, we need to do a deep compare
    if (JSON.stringify(newVal) !== this.configString) {
      this.configString = JSON.stringify(newVal);
      this.$nextTick(() => this.graph?.resetSources());
    }
  }

  @Emit('update:config')
  save(cfg: GraphConfig = this.graphCfg): GraphConfig {
    return cfg;
  }

  created(): void {
    this.configString = JSON.stringify(this.graphCfg);
  }

  get dialogOpen(): boolean {
    return this.value;
  }

  set dialogOpen(val: boolean) {
    this.$emit('input', val);
  }

  get graphCfg(): GraphConfig {
    return {
      ...emptyGraphConfig(),
      ...this.config,
    };
  }

  get targetKeys(): string[][] {
    return targetSplitter(this.graphCfg.targets)
      .map(key => [key, this.graphCfg.renames[key] || key]);
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isRightAxis(key: string): boolean {
    return this.graphCfg.axes[key] === 'y2';
  }

  axisLabel(key: string): string {
    return this.isRightAxis(key) ? 'Y2' : 'Y1';
  }

  updateKeySide(key: string, isRight: boolean): void {
    this.$set(this.graphCfg.axes, key, isRight ? 'y2' : 'y');
    this.save();
  }

  saveParams(params: QueryParams): void {
    this.$set(this.graphCfg, 'params', params);
    this.save();
  }

  saveLayout(layout: Partial<Layout>): void {
    this.$set(this.graphCfg, 'layout', layout);
    this.save();
  }

  updateDuration(): void {
    createDialog({
      component: 'InputDialog',
      title: 'Duration',
      value: this.graphCfg.params.duration,
    })
      .onOk(val => {
        this.graphCfg.params.duration = durationString(val);
        this.save(this.graphCfg);
      });
  }

  chooseDuration(): void {
    const current = this.graphCfg.params.duration ?? '1h';
    createDialog({
      component: 'DurationQuantityDialog',
      title: 'Custom graph duration',
      value: bloxQty(current),
      label: 'Duration',
    })
      .onOk(unit => this.saveParams({ duration: durationString(unit) }));
  }
}
</script>

<template>
  <q-dialog
    v-model="dialogOpen"
    v-bind="dialogProps"
    transition-show="fade"
    maximized
  >
    <q-card v-if="dialogOpen" class="text-white">
      <HistoryGraph
        ref="graph"
        :graph-id="id"
        :config="graphCfg"
        :use-presets="!noDuration"
        use-range
        maximized
        @params="saveParams"
        @layout="saveLayout"
      >
        <template #controls>
          <q-btn-dropdown flat icon="settings">
            <ExportGraphAction
              :config="graphCfg"
              :header="graphCfg.layout.title"
            />
            <q-item clickable @click="updateDuration">
              <q-item-section>Duration</q-item-section>
              <q-item-section class="col-auto">
                {{ durationString(graphCfg.params.duration) }}
              </q-item-section>
            </q-item>
            <q-expansion-item label="Display Axis">
              <q-item
                v-for="[key, renamed] in targetKeys"
                :key="key"
                :inset-level="0.2"
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
          <DialogCloseButton />
        </template>
      </HistoryGraph>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.mirrored
  -webkit-transform: scaleX(-1)
  transform: scaleX(-1)
</style>
