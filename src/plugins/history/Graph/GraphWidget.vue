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

    <WidgetToolbar :title="widgetId" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="settingsModalOpen = true">
          <q-list dark bordered>
            <q-item v-close-popup dark clickable @click="graphModalOpen = true">
              <q-item-section avatar>
                <q-icon name="mdi-chart-line"/>
              </q-item-section>
              <q-item-section>Show maximized</q-item-section>
            </q-item>
            <q-expansion-item label="Presets" icon="mdi-timelapse">
              <q-list dark>
                <q-item
                  v-close-popup
                  v-for="(preset, idx) in presets"
                  :key="idx"
                  :inset-level="1"
                  dark
                  clickable
                  @click="() => applyPreset(preset)"
                >
                  <q-item-section>{{ preset.duration }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
            <q-item v-close-popup dark clickable @click="regraph">
              <q-item-section avatar>
                <q-icon name="refresh"/>
              </q-item-section>
              <q-item-section>Refresh</q-item-section>
            </q-item>
            <q-item v-close-popup v-if="$props.onCopy" dark clickable @click="$props.onCopy">
              <q-item-section avatar>
                <q-icon name="file_copy"/>
              </q-item-section>
              <q-item-section>Copy widget</q-item-section>
            </q-item>
            <q-item v-close-popup v-if="$props.onMove" dark clickable @click="$props.onMove">
              <q-item-section avatar>
                <q-icon name="exit_to_app"/>
              </q-item-section>
              <q-item-section>Move widget</q-item-section>
            </q-item>
            <q-item v-close-popup v-if="$props.onDelete" dark clickable @click="$props.onDelete">
              <q-item-section avatar>
                <q-icon name="delete"/>
              </q-item-section>
              <q-item-section>Delete widget</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <div class="col">
      <GraphCard ref="widgetGraph" :id="$props.id" :config="graphCfg"/>
    </div>
  </q-card>
</template>
