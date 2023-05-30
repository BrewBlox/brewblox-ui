<script setup lang="ts">
import { IS_WEBKIT } from '@/const';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import {
  defaultPresets as durationPresets,
  emptyGraphConfig,
} from '@/plugins/history/utils';
import { createDialog } from '@/utils/dialog';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';
import { nanoid } from 'nanoid';
import { computed, inject, nextTick, ref, shallowRef, watch } from 'vue';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/GraphDisplay';
import { usePart } from '../composables';
import { GRAPH_CONFIG_KEY, SQUARE_SIZE } from '../const';
import { ZoomTransformKey } from '../symbols';

const { settings, patchSettings, width, height, interactable, placeholder } =
  usePart.setup();

const graphId = nanoid();
const presets = durationPresets();

/**
 * This component has some workarounds for a WebKit bug.
 * SVG transformation is not applied correctly to SVG foreignObject content.
 * See: https://bugs.webkit.org/show_bug.cgi?id=23113
 *
 * The element is never rotated, but it is transformed during SVG zoom/pan.
 * To compensate for the lack of transformation by WebKit, we explicitly set rendered width/height.
 * For non-WebKit browsers, this is always equal to the width/height of the SVG part.
 * For WebKit, we get the (transformed) width/height of the foreignObject element.
 */
const actualGraphSize = ref({
  width: width.value,
  height: height.value,
});

const sourceRevision = ref<Date>(new Date());
const renderRevision = ref<Date>(new Date());
const baseConfig = shallowRef<GraphConfig>(emptyGraphConfig());

const graphHidden = ref(false);
const fobjElement = ref<SVGForeignObjectElement>();
const activeTransform = inject(ZoomTransformKey, ref());

const sizedConfig = computed<GraphConfig>(() => ({
  ...baseConfig.value,
  layout: {
    ...actualGraphSize.value,
    margin: { t: 5, l: 5, r: 0, b: 5 },
    showlegend: !IS_WEBKIT || actualGraphSize.value.height > 200,
  },
}));

const refresh = debounce(
  () =>
    nextTick(() => {
      if (IS_WEBKIT && fobjElement.value) {
        const rect = fobjElement.value.getBoundingClientRect();
        actualGraphSize.value = {
          width: rect.width,
          height: rect.height,
        };
      } else {
        actualGraphSize.value = {
          width: width.value,
          height: height.value,
        };
      }

      renderRevision.value = new Date();
      graphHidden.value = false;
    }),
  500,
  { leading: false, trailing: true },
);

function edit(): void {
  createDialog({
    component: 'GraphEditorDialog',
    componentProps: {
      title: 'Edit Graph',
      config: baseConfig.value,
    },
  }).onOk((cfg) => {
    patchSettings({ [GRAPH_CONFIG_KEY]: cfg });
  });
}

function showMaximized(): void {
  createDialog({
    component: 'GraphDialog',
    componentProps: {
      graphId,
      config: baseConfig.value,
      sharedSources: true,
      usePresets: true,
    },
  }).onOk((cfg) => {
    patchSettings({ [GRAPH_CONFIG_KEY]: cfg });
  });
}

function activatePreset(params: QueryParams): void {
  patchSettings({ [GRAPH_CONFIG_KEY]: { ...baseConfig.value, params } });
}

watch(
  settings,
  (newSettings) => {
    const cfg: GraphConfig = merge(
      emptyGraphConfig(),
      newSettings[GRAPH_CONFIG_KEY],
    );
    if (!isEqual(cfg, baseConfig.value)) {
      baseConfig.value = cfg;
      sourceRevision.value = new Date();
    }
  },
  { immediate: true },
);

// The graph is transformed smoothly on non-WebKit browsers
// No need to hide and re-render it
if (IS_WEBKIT) {
  watch(activeTransform, () => {
    graphHidden.value = true;
    refresh();
  });
}

watch([interactable, width, height], () => refresh());
</script>

<template>
  <svg v-bind="{ width, height }">
    <ChartSvgIcon
      v-if="placeholder"
      v-bind="{ width, height }"
    />
    <template v-else-if="graphHidden">
      <PatternBackground v-bind="{ width, height }" />
      <ChartSvgIcon
        :x="width / 2 - SQUARE_SIZE / 2"
        :y="height / 2 - SQUARE_SIZE / 2"
      />
    </template>
    <foreignObject
      v-if="!placeholder"
      ref="fobjElement"
      v-bind="{ width, height }"
    >
      <HistoryGraph
        v-show="!graphHidden"
        v-bind="{
          graphId,
          sourceRevision,
          renderRevision,
          config: sizedConfig,
          static: true,
        }"
        class="fit"
        style="position: fixed"
      >
        <template
          v-if="IS_WEBKIT"
          #error="{ error }"
        >
          <div class="q-pa-md q-gutter-sm">
            <q-icon
              name="mdi-chart-line"
              size="md"
            />
            <div>{{ error }}</div>
          </div>
        </template>
      </HistoryGraph>
    </foreignObject>
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="showMaximized"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item
            v-close-popup
            clickable
            @click="showMaximized"
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
                  :active="baseConfig.params.duration === cfg.duration"
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
