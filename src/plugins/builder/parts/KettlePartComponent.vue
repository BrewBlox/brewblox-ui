<script lang="ts">
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import {
  DEFAULT_FILL_PCT,
  DEFAULT_SIZE,
  KETTLE_FILL_PCT_KEY,
  MAX_SIZE,
  MIN_SIZE,
} from '../blueprints/Kettle';
import { usePart } from '../composables';
import { COLOR_KEY, LABEL_KEY } from '../const';

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
      DEFAULT_SIZE,
      MAX_SIZE,
      MIN_SIZE,
      KETTLE_FILL_PCT_KEY,
      DEFAULT_FILL_PCT,
      LABEL_KEY,
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
          <ColorMenuContent />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <SliderMenuContent
            :min="0"
            :max="100"
            :default="DEFAULT_FILL_PCT"
            :settings-key="KETTLE_FILL_PCT_KEY"
            label="Liquid level"
            postfix="%"
          />
          <TextMenuContent
            :settings-key="LABEL_KEY"
            label="Edit label"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
