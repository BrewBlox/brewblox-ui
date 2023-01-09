<script lang="ts">
import { computed, defineComponent } from 'vue';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/ImageDisplay';
import { usePart } from '../composables';
import { URL_KEY } from '../const';

export default defineComponent({
  name: 'ImageDisplayPartComponent',
  setup() {
    const { settings, width, height, passthrough } = usePart.setup();

    const href = computed<string>(
      () => settings.value[URL_KEY] || '/image-placeholder.png',
    );

    return {
      URL_KEY,
      MIN_SIZE,
      MAX_SIZE,
      DEFAULT_SIZE,
      width,
      height,
      passthrough,
      href,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <image v-bind="{ width, height, href }" />
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <TextMenuContent
            :settings-key="URL_KEY"
            label="Image URL"
          />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <ToggleMenuContent
            v-model="passthrough"
            label="Flow through part"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
