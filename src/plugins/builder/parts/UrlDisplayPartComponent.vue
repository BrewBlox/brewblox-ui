<script lang="ts">
import { isAbsoluteUrl } from '@/utils/url';
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { usePart } from '../composables';
import { LABEL_KEY, URL_KEY } from '../const';

export default defineComponent({
  name: 'UrlDisplayPartComponent',
  setup() {
    const { settings, width, height, bordered } = usePart.setup();

    const url = computed<string>(() => settings.value[URL_KEY] || '');

    const titleText = computed<string>(
      () => settings.value[LABEL_KEY] || url.value || 'Url Display',
    );

    function interact(): void {
      if (url.value) {
        if (isAbsoluteUrl(url.value)) {
          window.open(url.value, '_blank');
        } else {
          useRouter().push(url.value);
        }
      }
    }

    return {
      width,
      height,
      bordered,
      url,
      titleText,
      interact,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="interact"
    />
    <foreignObject v-bind="{ width, height }">
      <div
        class="fit text-bold text-center q-mt-sm grid-label"
        style="text-decoration: underline; font-size: 130%"
      >
        {{ titleText }}
      </div>
    </foreignObject>
    <BuilderBorder
      v-if="bordered"
      v-bind="{ width, height }"
    />
  </svg>
</template>
