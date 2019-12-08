<script lang="ts">
import { Component, Prop, Ref } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { durationMs, unitDurationString } from '@/helpers/functional';
import { Unit } from '@/helpers/units';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets } from '@/plugins/history/getters';
import { GraphConfig, QueryParams } from '@/plugins/history/types';

import { PidBlock } from './types';


@Component
export default class PidShareDialog extends DialogBase {
  presets = defaultPresets();
  params: QueryParams | null = null;

  @Ref()
  readonly viewparent!: HTMLElement;

  @Ref()
  readonly graph!: HistoryGraph;

  @Prop({ type: String, required: true })
  public readonly graphId!: string;

  @Prop({ type: Object, required: true })
  public readonly block!: PidBlock;

  @Prop({ type: Object, required: true })
  public readonly graphCfg!: GraphConfig;

  get activeGraphCfg(): GraphConfig {
    return {
      ...this.graphCfg,
      params: this.params ?? this.graphCfg.params,
    };
  }

  applyParams(params: QueryParams): void {
    this.params = { ...params };
    this.$nextTick(() => this.graph?.resetSources());
  }

  chooseDuration(): void {
    const current = this.activeGraphCfg.params.duration ?? '1h';
    createDialog({
      component: 'TimeUnitDialog',
      parent: this,
      title: 'Custom graph duration',
      value: new Unit(durationMs(current), 'ms'),
      label: 'Duration',
    })
      .onOk(unit => this.applyParams({ duration: unitDurationString(unit) }));
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized @hide="onDialogHide">
    <q-card class="maximized bg-dark-bright column">
      <DialogToolbar class="col-auto">
        {{ block.id }}
        <template #buttons>
          <q-btn-dropdown stretch auto-close flat label="timespan" icon="mdi-timelapse">
            <ActionItem
              v-for="(preset, idx) in presets"
              :key="idx"
              :active="activeGraphCfg.params.duration === preset.duration"
              :label="preset.duration"
              @click="applyParams(preset)"
            />
            <ActionItem label="Custom" @click="chooseDuration" />
          </q-btn-dropdown>
        </template>
      </DialogToolbar>
      <div ref="viewparent" class="col row full-width bg-dark">
        <div class="col-3 q-pa-md">
          <q-list dense>
            <q-item>
              <q-item-section class="text-h6">
                {{ block.id }}
              </q-item-section>
            </q-item>
            <q-item v-for="(v, k) in block.data" :key="`data-${k}`">
              <q-item-section>{{ k }}</q-item-section>
              <q-item-section>{{ v }}</q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-separator vertical inset />
        <HistoryGraph ref="graph" class="col" :graph-id="graphId" :config="activeGraphCfg" />
      </div>
    </q-card>
  </q-dialog>
</template>
