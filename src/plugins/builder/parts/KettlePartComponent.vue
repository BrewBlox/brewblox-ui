<script lang="ts">
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import {
  DEFAULT_FILL_PCT,
  DEFAULT_SIZE_X,
  DEFAULT_SIZE_Y,
  KETTLE_FILL_PCT_KEY,
} from '../blueprints/Kettle';
import { usePart } from '../composables';
import { COLOR_KEY } from '../const';

export default defineComponent({
  name: 'KettlePartComponent',
  setup() {
    const { settings, width, height } = usePart.setup();

    const filledHeight = computed<number>(() => {
      const pct = settings.value[KETTLE_FILL_PCT_KEY] ?? DEFAULT_FILL_PCT;
      return pct * (height.value / 100);
    });

    const color = computed<string>(() =>
      colorString(settings.value[COLOR_KEY]),
    );

    return {
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
      KETTLE_FILL_PCT_KEY,
      DEFAULT_FILL_PCT,
      width,
      height,
      filledHeight,
      color,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <rect
      :fill="color"
      :x="2"
      :y="height - filledHeight + 2"
      :width="width - 4"
      :height="filledHeight - 4"
      rx="2"
      ry="2"
    />
    <BuilderBorder
      v-bind="{ width, height }"
      large
    />
    <BuilderLabelValues
      :width="width"
      :height="50"
    />
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <TextMenuContent />
          <ColorMenuContent />
          <SizeMenuContent
            :min="{ width: 2, height: 2 }"
            :max="{ width: 10, height: 10 }"
            :default="{ width: DEFAULT_SIZE_X, height: DEFAULT_SIZE_Y }"
          />
          <SliderMenuContent
            :min="0"
            :max="100"
            :default="DEFAULT_FILL_PCT"
            :settings-key="KETTLE_FILL_PCT_KEY"
            label="Liquid level (%)"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
