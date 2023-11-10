<script setup lang="ts">
import { WebframeWidget } from './types';
import { useContext, useWidget } from '@/composables';
import { computed } from 'vue';

const { config, patchConfig } = useWidget.setup<WebframeWidget>();
const { context } = useContext.setup();

const scale = computed<number>({
  get: () => config.value.scale || 1,
  set: (scale) => patchConfig({ scale }),
});

const pctScale = computed<number>({
  get: () => scale.value * 100,
  set: (v) => (scale.value = (v || 100) / 100),
});

const url = computed<string>({
  get: () => config.value.url,
  set: (url) => patchConfig({ url }),
});
</script>

<template>
  <Card no-scroll>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div
      v-if="context.mode === 'Basic'"
      style="overflow: hidden"
      class="fit"
    >
      <iframe
        :src="config.url"
        referrerpolicy="no-referrer"
        allowfullscreen
        :style="{
          margin: '1%',
          border: 'none',
          transform: `scale(${scale})`,
          transformOrigin: '0 0',

          // Desired width/height is 98%. (1% margin)
          // To offset scaling, we need to increase/decrease size.
          // If scale == 0.5, then width/height must be 98 * 2 == 196%
          width: 98 * (1 / scale) + '%',
          height: 98 * (1 / scale) + '%',
        }"
      />
    </div>

    <div
      v-if="context.mode === 'Full'"
      class="widget-body column q-mt-none"
    >
      <TextField
        v-model="url"
        title="URL"
        label="URL"
        message="URLs must include the http:// or https:// prefix."
        class="col-grow"
        tag-style="word-break: break-word"
        :editor-props="{ fontSize: '100%' }"
      />

      <NumberField
        v-model="pctScale"
        label="Content size"
        title="Set zoom level"
        class="col-grow"
        suffix="%"
        :decimals="0"
        :rules="[(v) => v == null || v > 0 || 'Value must be > 0']"
      />
    </div>
  </Card>
</template>
