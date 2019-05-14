<script lang="ts">
import Component from 'vue-class-component';
import WidgetBase from '@/components/Widget/WidgetBase';
import { GraphConfig } from '@/components/Graph/types';
import { defaultPresets } from '@/components/Graph/getters';
import { Watch } from 'vue-property-decorator';
import { QueryParams } from '@/store/history/types';

@Component
export default class GraphWidget extends WidgetBase {
  windowWidth: number = 0;
  settingsModalOpen: boolean = false;
  graphModalOpen: boolean = false;
  $refs!: {
    widgetGraph: any;
  }

  get showFormGraph() {
    return this.windowWidth >= 1500;
  }

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

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  applyPreset(preset: QueryParams) {
    this.saveConfig({
      ...this.graphCfg,
      params: { ...preset },
    });
  }

  updateWidth() {
    this.windowWidth = window.innerWidth;
  }

  @Watch('graphCfg', { deep: true })
  regraph() {
    this.$nextTick(() => this.$refs.widgetGraph.resetListeners());
  }

  mounted() {
    this.updateWidth();
    this.$nextTick(() => window.addEventListener('resize', this.updateWidth));
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWidth);
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="settingsModalOpen" no-backdrop-dismiss class="row">
      <GraphForm
        v-if="settingsModalOpen"
        v-bind="$props"
        :field="graphCfg"
        :on-change-field="saveConfig"
      />
      <div v-if="settingsModalOpen && showFormGraph" class="form-graph col-auto">
        <GraphCard :id="$props.id" :config="graphCfg" shared-listeners/>
      </div>
    </q-dialog>

    <q-dialog v-model="graphModalOpen" maximized>
      <q-card v-if="graphModalOpen" dark>
        <GraphCard :id="$props.id" :config="graphCfg" shared-listeners>
          <q-btn-dropdown flat auto-close label="presets" icon="mdi-timelapse">
            <q-list dark link>
              <q-item
                v-for="(preset, idx) in presets"
                :key="idx"
                dark
                clickable
                @click="() => applyPreset(preset)"
              >
                <q-item-section>{{ preset.duration }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn v-close-popup flat label="close"/>
        </GraphCard>
      </q-card>
    </q-dialog>

    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="settingsModalOpen = true">
          <q-list dark bordered>
            <ActionItem
              icon="mdi-chart-line"
              label="Show maximized"
              @click="graphModalOpen = true"
            />
            <q-expansion-item label="Timespan" icon="mdi-timelapse">
              <q-list dark>
                <q-item
                  v-close-popup
                  v-for="(preset, idx) in presets"
                  :key="idx"
                  :inset-level="1"
                  dark
                  clickable
                  @click="applyPreset(preset)"
                >
                  <q-item-section>{{ preset.duration }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
            <ActionItem icon="refresh" label="Refresh" @click="regraph"/>
            <ActionItem
              v-if="$props.onCopy"
              icon="file_copy"
              label="Copy widget"
              @click="$props.onCopy(widgetId)"
            />
            <ActionItem
              v-if="$props.onMove"
              icon="exit_to_app"
              label="Move widget"
              @click="$props.onMove(widgetId)"
            />
            <ActionItem
              v-if="$props.onDelete"
              icon="delete"
              label="Delete widget"
              @click="$props.onDelete(widgetId)"
            />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <div class="col">
      <GraphCard ref="widgetGraph" :id="$props.id" :config="graphCfg"/>
    </div>
  </q-card>
</template>

<style>
.form-graph {
  margin-left: 40px;
}
</style>
