<script lang="ts">
import { uid } from 'quasar';
import { CreateElement, VNode } from 'vue';
import { Component, Ref } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { durationMs, unitDurationString } from '@/helpers/functional';
import { Unit } from '@/helpers/units';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/getters';
import { GraphConfig, QueryParams } from '@/plugins/history/types';

@Component
export default class GraphWidget extends WidgetBase<GraphConfig> {
  downsampling: any = {};

  // Separate IDs for graphs in widget and dialog wrapper
  // This prevents source create/delete race conditions when switching
  widgetGraphId: string | null = null;
  wrapperGraphId: string | null = null;

  @Ref()
  readonly wrapperGraph!: HistoryGraph;

  @Ref()
  readonly widgetGraph!: HistoryGraph;

  created(): void {
    this.widgetGraphId = uid();
    this.wrapperGraphId = uid();
  }

  mounted(): void {
    this.$watch('widget.cols', this.refresh);
    this.$watch('widget.rows', this.refresh);
  }

  get config(): GraphConfig {
    return {
      ...emptyGraphConfig(),
      ...this.widget.config,
    };
  }

  saveConfig(config: GraphConfig = this.config): void {
    this.widget.config = config;
    this.saveWidget(this.widget);
    this.regraph();
  }

  // Overrides WidgetBase
  *cardClassGenerator(): Generator<string, void, undefined> {
    yield this.inDialog
      ? 'widget-modal'
      : 'widget-dashboard';

    if (this.$q.screen.lt.lg) {
      yield 'widget-dense';
    }

    if (this.mode === 'Basic') {
      yield* ['col', 'column'];
    }

    if (this.mode === 'Full' && !this.inDialog) {
      yield* ['overflow-auto', 'scroll'];
    }
  }

  get cardStyle(): Mapped<string> {
    return this.inDialog && this.mode === 'Basic'
      ? { height: '60vh' }
      : {};
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isActivePreset(preset: QueryParams): boolean {
    return JSON.stringify(preset) === JSON.stringify(this.config.params);
  }

  applyPreset(preset: QueryParams): void {
    this.config.params = { ...preset };
    this.saveConfig();
  }

  chooseDuration(): void {
    const current = this.config.params.duration ?? '1h';
    createDialog({
      component: 'TimeUnitDialog',
      parent: this,
      title: 'Custom graph duration',
      value: new Unit(durationMs(current), 'ms'),
      label: 'Duration',
    })
      .onOk(unit => {
        this.config.params = { duration: unitDurationString(unit) };
        this.saveConfig();
      });
  }

  async regraph(): Promise<void> {
    await this.$nextTick();
    if (this.widgetGraph !== undefined) {
      this.widgetGraph.resetSources();
    }
    if (this.wrapperGraph !== undefined) {
      this.wrapperGraph.resetSources();
    }
  }

  async refresh(): Promise<void> {
    await this.$nextTick();
    if (this.widgetGraph !== undefined) {
      this.widgetGraph.refresh();
    }
    if (this.wrapperGraph !== undefined) {
      this.wrapperGraph.refresh();
    }
  }

  renderControls(h: CreateElement): VNode {
    return h('q-btn-dropdown',
      {
        props: {
          flat: true,
          autoClose: true,
          label: 'presets',
          icon: 'mdi-timelapse',
        },
      },
      [
        h('q-list',
          { props: { link: true } },
          [
            defaultPresets().map(preset =>
              h('q-item',
                {
                  props: {
                    clickable: true,
                    active: this.isActivePreset(preset),
                  },
                  on: { click: () => this.applyPreset(preset) },
                },
                [h('q-item-section', [preset.duration])])),
          ]),
      ]);
  }

  currentGraphId(): string | null {
    if (this.widgetGraph !== undefined) { return this.widgetGraphId; };
    if (this.wrapperGraph !== undefined) { return this.wrapperGraphId; };
    return null;
  }

  showGraphDialog(): void {
    const currentId = this.currentGraphId();
    createDialog({
      component: 'GraphDialog',
      parent: this,
      graphId: currentId || uid(),
      config: { ...this.config, layout: { ...this.config.layout, title: this.widget.title } },
      sharedSources: currentId !== null,
      renderControls: this.renderControls,
    });
  }
}
</script>

<template>
  <GraphCardWrapper show-initial :show="inDialog && mode === 'Full'">
    <template #graph>
      <HistoryGraph
        ref="wrapperGraph"
        :graph-id="wrapperGraphId"
        :config="config"
        @downsample="v => downsampling = v"
      />
    </template>

    <q-card :class="cardClass" :style="cardStyle">
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="showGraphDialog" />
          <ExportGraphAction :config="config" :header="widget.title" />
          <ActionItem icon="refresh" label="Refresh" @click="regraph" />
        </template>
        <template #menus>
          <WidgetActions :crud="crud" />
          <ActionSubmenu label="Timespan">
            <div class="row wrap" style="max-width: 300px">
              <q-btn
                v-for="(preset, idx) in presets"
                :key="idx"
                :label="preset.duration"
                :color="isActivePreset(preset) ? 'primary' : 'white'"
                class="col-3"
                no-caps
                flat
                @click="applyPreset(preset)"
              />
              <q-btn label="Custom" class="col-3" flat no-caps @click="chooseDuration" />
            </div>
          </ActionSubmenu>
        </template>
      </component>

      <template v-if="mode === 'Basic'">
        <div class="col">
          <HistoryGraph
            ref="widgetGraph"
            :graph-id="widgetGraphId"
            :config="config"
            @downsample="v => downsampling = v"
          />
        </div>
      </template>
      <template v-else>
        <div :class="{'col-grow': true, 'scroll-parent': inDialog}">
          <component :is="inDialog ? 'q-scroll-area' : 'div'">
            <GraphEditor :config="config" :downsampling="downsampling" @update:config="saveConfig" />
          </component>
        </div>
      </template>
    </q-card>
  </GraphCardWrapper>
</template>

<style scoped>
.scroll-parent {
  height: calc(100% - 50px);
}
.widget-dashboard.widget-dense {
  height: 100vh;
}
</style>
