<script lang="ts">
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import {
  defaultPresets as durationPresets,
  emptyGraphConfig,
} from '@/plugins/history/utils';
import { createDialog } from '@/utils/dialog';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';
import { nanoid } from 'nanoid';
import { defineComponent, ref, shallowRef, watch } from 'vue';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/GraphDisplay';
import { usePart } from '../composables';
import { GRAPH_CONFIG_KEY } from '../const';

export default defineComponent({
  name: 'GraphDisplayPartComponent',
  setup() {
    const { settings, patchSettings, width, height, interactable } =
      usePart.setup();

    const graphId = nanoid();
    const sourceRevision = ref<Date>(new Date());
    const renderRevision = ref<Date>(new Date());
    const config = shallowRef<GraphConfig>(emptyGraphConfig());
    const presets = durationPresets();

    watch(
      settings,
      (newSettings) => {
        const cfg: GraphConfig = merge(
          emptyGraphConfig(),
          newSettings[GRAPH_CONFIG_KEY],
        );
        if (!isEqual(cfg, config.value)) {
          config.value = cfg;
          sourceRevision.value = new Date();
        }
      },
      { immediate: true },
    );

    watch(interactable, () => {
      renderRevision.value = new Date();
    });

    function edit(): void {
      createDialog({
        component: 'GraphEditorDialog',
        componentProps: {
          title: 'Edit Graph',
          config: config.value,
        },
      }).onOk((cfg) => {
        patchSettings({ [GRAPH_CONFIG_KEY]: cfg });
      });
    }

    function maximized(): void {
      createDialog({
        component: 'GraphDialog',
        componentProps: {
          graphId,
          config: config.value,
          sharedSources: true,
          usePresets: true,
        },
      }).onOk((cfg) => {
        patchSettings({ [GRAPH_CONFIG_KEY]: cfg });
      });
    }

    function activatePreset(params: QueryParams): void {
      patchSettings({ [GRAPH_CONFIG_KEY]: { ...config.value, params } });
    }

    return {
      MIN_SIZE,
      MAX_SIZE,
      DEFAULT_SIZE,
      width,
      height,
      interactable,
      graphId,
      config,
      presets,
      sourceRevision,
      renderRevision,
      edit,
      maximized,
      activatePreset,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <foreignObject v-bind="{ width, height }">
      <HistoryGraph
        v-bind="{
          graphId,
          config,
          sourceRevision,
          renderRevision,
          interactable: false,
        }"
      />
    </foreignObject>
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="maximized"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item
            v-close-popup
            clickable
            @click="maximized"
          >
            <q-item-section>Show fullscreen</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            clickable
            @click="edit"
          >
            <q-item-section>Edit settings</q-item-section>
          </q-item>
          <q-item clickable>
            <q-item-section>Timespan</q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right" />
            </q-item-section>
            <q-menu
              anchor="top end"
              self="top start"
            >
              <q-list>
                <q-item
                  v-for="cfg in presets"
                  :key="cfg.duration"
                  v-close-popup
                  dense
                  clickable
                  :active="config.params.duration === cfg.duration"
                  @click="activatePreset(cfg)"
                >
                  <q-item-section>{{ cfg.duration }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-item>
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
