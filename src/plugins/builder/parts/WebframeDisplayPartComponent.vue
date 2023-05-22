<script setup lang="ts">
import { IS_WEBKIT } from '@/const';
import debounce from 'lodash/debounce';
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
  WEBFRAME_SCALE_KEY,
} from '../blueprints/WebframeDisplay';
import { usePart } from '../composables';
import { SQUARE_SIZE, URL_KEY } from '../const';
import { ZoomTransformKey } from '../symbols';

function inverted(baseline: number): number {
  return (1 - baseline) / baseline + 1;
}

const { settings, width, height, editable, placeholder } = usePart.setup();

/**
 * This component has some workarounds for a WebKit bug.
 * SVG transformation is not applied correctly to SVG foreignObject content.
 * See: https://bugs.webkit.org/show_bug.cgi?id=23113
 *
 * The element is never rotated, but it is transformed.
 * To compensate for the lack of transformation by WebKit, we explicitly set rendered width/height.
 * For non-WebKit browsers, this is always equal to the width/height of the SVG part.
 * For WebKit, we get the (transformed) width/height of the foreignObject element.
 */
const actualFrameSize = ref({
  width: width.value,
  height: height.value,
});
const position = ref<XYPosition>();

const hidden = ref(true);
const fobjElement = ref<SVGForeignObjectElement>();
const frameElement = ref<HTMLIFrameElement>();
const activeTransform = inject(ZoomTransformKey, ref());

const url = computed<string>(() => {
  if (placeholder) {
    return 'https://xkcd.com';
  }
  return settings.value[URL_KEY] || '';
});

const scale = computed<number>(() => {
  if (placeholder) {
    return 0.6;
  }
  return Number(settings.value[WEBFRAME_SCALE_KEY] || 100) / 100;
});

const smallScale = computed<number>(() =>
  scale.value <= 1 ? scale.value : inverted(scale.value),
);

const bigScale = computed<number>(() =>
  scale.value >= 1 ? scale.value : inverted(scale.value),
);

const refresh = debounce(
  () =>
    nextTick(() => {
      if (fobjElement.value) {
        const { x, y } = fobjElement.value.getBoundingClientRect();
        position.value = { x, y };
      }
      // if (IS_WEBKIT && fobjElement.value) {
      //   const rect = fobjElement.value.getBoundingClientRect();
      //   const k = activeTransform.value?.k ?? 1;

      //   actualFrameSize.value = {
      //     width: rect.width * counterScale,
      //     height: rect.height * counterScale,
      //   };
      // } else {
      //   // counterScale = inverted(scale.value);
      //   counterScale = 1;
      //   actualFrameSize.value = {
      //     width: width.value * counterScale,
      //     height: height.value * counterScale,
      //   };
      // }

      // console.log(
      //   fobjElement.value,
      //   activeTransform.value,
      //   actualFrameSize.value,
      //   actualScale.value,
      //   counterScale,
      // );

      hidden.value = false;
    }),
  500,
  { leading: false, trailing: true },
);

// The graph is transformed smoothly on non-WebKit browsers
// No need to re-render it
if (IS_WEBKIT) {
  watch(activeTransform, () => {
    hidden.value = true;
    refresh();
  });
}

watch([width, height, scale], () => refresh());

onMounted(() => refresh());
</script>

<template>
  <svg
    ref="fobjElement"
    v-bind="{ width, height }"
  >
    <template v-if="editable || !url || hidden">
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
    <Teleport
      v-if="!hidden"
      to="main"
    >
      <div
        style="
          position: fixed;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          z-index: 999;
          background-color: red;
          display: block;
        "
      >
        hello
      </div>
      <!-- <iframe
        v-if="!editable && !hidden && url && position"
        ref="frameElement"
        :src="url"
        referrerpolicy="no-referrer"
        allowfullscreen
        class="dev-border"
        :style="{
          border: 'none',
          // transform: `scale(${bigScale})`,
          // transformOrigin: '0 0',
          pointerEvents: 'auto',
          position: 'absolute',
          left: 100 + 'px',
          top: 100 + 'px',
          width: width + 'px',
          height: height + 'px',
          zIndex: 1000,
        }"
      /> -->
    </Teleport>
    <!-- <foreignObject
      ref="fobjElement"
      v-bind="{ width, height }"
      class="dev-border"
    >
    </foreignObject> -->
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
