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
        <q-btn flat round dense icon="mdi-timelapse">
          <q-menu>
            <q-list dark link>
              <q-item
                v-for="(preset, idx) in presets"
                v-close-popup
                :key="idx"
                dark
                clickable
                @click="() => applyPreset(preset)"
              >
                <q-item-section>{{ preset.duration }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
      <q-item-section side>
        <q-btn flat round dense icon="mdi-chart-line" @click="graphModalOpen = true"/>
      </q-item-section>
      <q-item-section side>
        <q-btn flat round dense icon="settings" @click="settingsModalOpen = true"/>
      </q-item-section>
      <q-item-section side>
        <q-btn flat round dense icon="refresh" @click="regraph"/>
      </q-item-section>
    </WidgetToolbar>

    <div class="col">
      <GraphCard :id="$props.id" ref="widgetGraph" :config="graphCfg"/>
    </div>
  </q-card>
</template>
