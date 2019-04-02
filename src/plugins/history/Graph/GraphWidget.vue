<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { defaultPresets } from '@/components/Graph/getters';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { QueryParams } from '@/store/history/state';

@Component
export default class GraphWidget extends WidgetBase {
  settingsModalOpen: boolean = false;
  graphModalOpen: boolean = false;
  $refs!: {
    widgetGraph: any;
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

  saveConfig(cfg: GraphConfig) {
    this.$props.onChangeConfig(this.$props.id, { ...cfg });
  }

  applyPreset(preset: QueryParams) {
    this.saveConfig({
      ...this.graphCfg,
      params: { ...preset },
    });
  }

  @Watch('graphCfg', { deep: true })
  regraph() {
    this.$nextTick(() => this.$refs.widgetGraph.resetMetrics());
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="settingsModalOpen" no-backdrop-dismiss>
      <GraphForm
        v-if="settingsModalOpen"
        v-bind="$props"
        :field="graphCfg"
        :on-change-field="saveConfig"
      />
    </q-dialog>

    <q-dialog v-model="graphModalOpen" maximized>
      <q-card v-if="graphModalOpen" dark>
        <GraphCard :id="$props.id" :config="graphCfg" shared-metrics>
          <q-btn-dropdown flat label="presets" icon="mdi-timelapse">
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
            <q-expansion-item label="Presets" icon="mdi-timelapse">
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
