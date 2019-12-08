<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { durationMs, durationString, unitDurationString } from '@/helpers/functional';
import { Unit } from '@/helpers/units';
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

  @Emit('update:config')
  change(cfg: GraphConfig = this.graphCfg): GraphConfig {
    return cfg;
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
    this.change({
      ...this.graphCfg,
      axes: {
        ...this.graphCfg.axes,
        [key]: isRight ? 'y2' : 'y',
      },
    });
  }

  applyPreset(preset: QueryParams): void {
    this.change({
      ...this.graphCfg,
      params: { ...preset },
    });
  }

  updateDuration(): void {
    createDialog({
      component: 'InputDialog',
      title: 'Duration',
      parent: this,
      value: this.graphCfg.params.duration,
    })
      .onOk(val => {
        this.graphCfg.params.duration = durationString(val);
        this.change(this.graphCfg);
      });
  }

  chooseDuration(): void {
    const current = this.graphCfg.params.duration ?? '1h';
    createDialog({
      component: 'TimeUnitDialog',
      parent: this,
      title: 'Custom graph duration',
      value: new Unit(durationMs(current), 'ms'),
      label: 'Duration',
    })
      .onOk(unit => {
        this.graphCfg.params = { duration: unitDurationString(unit) };
        this.change(this.graphCfg);
      });
  }

  @Watch('graphCfg')
  onCfgChange(newVal): void {
    // Vue considers configuration "changed" with every block data update
    // To avoid constantly refreshing sources, we need to do a deep compare
    if (JSON.stringify(newVal) !== this.configString) {
      this.configString = JSON.stringify(newVal);
      this.$nextTick(() => this.graph?.resetSources());
    }
  }

  created(): void {
    this.configString = JSON.stringify(this.graphCfg);
  }
}
</script>

<template>
  <q-dialog v-model="dialogOpen" maximized>
    <q-card v-if="dialogOpen" class="text-white bg-dark-bright">
      <HistoryGraph ref="graph" :graph-id="id" :config="graphCfg">
        <template #controls>
          <q-btn-dropdown v-if="!noDuration" auto-close flat label="timespan" icon="mdi-timelapse">
            <ActionItem
              v-for="(preset, idx) in presets"
              :key="idx"
              :active="preset.duration === graphCfg.params.duration"
              :label="preset.duration"
              @click="applyPreset(preset)"
            />
            <ActionItem label="Custom" @click="chooseDuration" />
          </q-btn-dropdown>
          <q-btn-dropdown flat label="settings" icon="settings">
            <ExportGraphAction
              :config="graphCfg"
              :header="graphCfg.layout.title"
            />
            <q-item link clickable @click="updateDuration">
              <q-item-section>Duration</q-item-section>
              <q-item-section class="col-auto">
                {{ durationString(graphCfg.params.duration) }}
              </q-item-section>
            </q-item>
            <q-expansion-item label="Display Axis">
              <q-item
                v-for="[key, renamed] in targetKeys"
                :key="key"
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
