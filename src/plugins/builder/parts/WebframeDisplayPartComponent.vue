<script setup lang="ts">
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
  WEBFRAME_SCALE_KEY,
} from '../blueprints/WebframeDisplay';
import { usePart } from '../composables';
import { SQUARE_SIZE, URL_KEY } from '../const';
import { PortalIdKey, ZoomTransformKey } from '../symbols';
import debounce from 'lodash/debounce';
import { computed, inject, nextTick, ref, watch } from 'vue';

const { settings, width, height, editable, placeholder, interactable } =
  usePart.setup();

/**
 * This component has some workarounds for a WebKit bug.
 * SVG transformation is not applied correctly to SVG foreignObject content.
 * See: https://bugs.webkit.org/show_bug.cgi?id=23113
 *
 * To bypass this problem, we render foreign content in a portal outside the SVG.
 * We must then manually apply the active SVG transformation.
 */

const hidden = ref(true);
const rect = ref<XYPosition & AreaSize>({ x: 0, y: 0, width: 0, height: 0 });
const svgElement = ref<SVGForeignObjectElement>();
const activeTransform = inject(ZoomTransformKey, ref());
const portalId = inject(PortalIdKey, '');

const url = computed<string>(() => settings.value[URL_KEY] || '');

const scale = computed<number>(
  () => Number(settings.value[WEBFRAME_SCALE_KEY] || 100) / 100,
);

const transformScale = computed<number>(() => activeTransform.value?.k || 1);

const refresh = debounce(
  () =>
    nextTick(() => {
      const matrix = svgElement.value?.getCTM();
      const box = svgElement.value?.getBoundingClientRect();
      if (matrix && box) {
        rect.value = {
          x: matrix.e,
          y: matrix.f,
          width: box.width,
          height: box.height,
        };
      }

      hidden.value = false;
    }),
  500,
  {
    leading: false,
    trailing: true,
  },
);

watch(
  [width, height, scale, activeTransform],
  () => {
    hidden.value = true;
    refresh();
  },
  { immediate: true },
);
</script>

<template>
  <svg
    ref="svgElement"
    v-bind="{ width, height }"
  >
    <ImageSvgIcon
      v-if="placeholder"
      v-bind="{ width, height }"
    />
    <template v-else-if="editable || hidden || !url">
      <PatternBackground v-bind="{ width, height }" />
      <ImageSvgIcon
        :x="width / 2 - SQUARE_SIZE / 2"
        :y="height / 2 - SQUARE_SIZE / 2"
      />
      <text
        x="10"
        y="20"
      >
        {{ url || 'No iframe URL set' }}
      </text>
    </template>
    <portal
      v-if="!placeholder && !editable && url"
      :to="portalId"
    >
      <iframe
        v-show="!hidden && rect.width > 0"
        ref="frameElement"
        :src="url"
        referrerpolicy="no-referrer"
        allowfullscreen
        :style="{
          border: 'none',
          transform: `scale(${scale * transformScale})`,
          transformOrigin: '0 0',
          pointerEvents: interactable ? 'auto' : 'none',
          opacity: interactable ? 1 : 0.8,
          position: 'relative',
          left: rect.x + 'px',
          top: rect.y + 'px',
          width: (1 / (scale * transformScale)) * rect.width + 'px',
          height: (1 / (scale * transformScale)) * rect.height + 'px',
        }"
      />
    </portal>
    <BuilderInteraction
      v-if="editable"
      v-bind="{ width, height }"
      class="dev-border"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <TextMenuContent
            :settings-key="URL_KEY"
            label="Edit URL"
            message="URL must include the http:// or https:// prefix."
          />
          <SliderMenuContent
            :min="10"
            :max="300"
            :default="100"
            :settings-key="WEBFRAME_SCALE_KEY"
            label="Adjust zoom"
            postfix="%"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
