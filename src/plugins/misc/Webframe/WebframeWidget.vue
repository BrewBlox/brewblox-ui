<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';

import { WebframeWidget } from './types';

export default defineComponent({
  name: 'WebframeWidget',
  setup() {
    const { config, saveConfig } = useWidget.setup<WebframeWidget>();
    const { context } = useContext.setup();

    const scale = computed<number>({
      get: () => config.value.scale || 1,
      set: (scale) => saveConfig({ ...config.value, scale }),
    });

    const pctScale = computed<number>({
      get: () => scale.value * 100,
      set: (v) => (scale.value = (v || 100) / 100),
    });

    const url = computed<string>({
      get: () => config.value.url,
      set: (url) => saveConfig({ ...config.value, url }),
    });

    const counterScale = computed<number>(
      // value * scale * counterScale == value
      () => (1 - scale.value) / scale.value + 1,
    );

    return {
      config,
      saveConfig,
      context,
      url,
      scale,
      pctScale,
      counterScale,
    };
  },
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
          // If scale == 0.5, then width/height must be 196%
          width: 98 * counterScale + '%',
          height: 98 * counterScale + '%',
        }"
      />
    </div>

    <div
      v-if="context.mode === 'Full'"
      class="widget-body column q-mt-none"
    >
      <InputField
        v-model="url"
        title="URL"
        label="URL"
        message="URLs must include the http:// or https:// prefix."
        class="col-grow"
        tag-style="word-break: break-word"
        :dialog-props="{ fontSize: '100%' }"
      />

      <InputField
        v-model="pctScale"
        type="number"
        label="Content size"
        title="Set zoom level"
        class="col-grow"
        suffix="%"
        :decimals="0"
        :rules="[(v) => v === null || v > 0 || 'Value must be > 0']"
      />
    </div>
  </Card>
</template>
