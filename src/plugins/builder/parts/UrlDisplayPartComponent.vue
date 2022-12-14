<script lang="ts">
import { isAbsoluteUrl } from '@/utils/url';
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { usePart } from '../composables';
import { LABEL_KEY, URL_KEY } from '../const';
import { textTransformation } from '../utils';

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
      textTransformation,
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
  <svg
    v-bind="{ width, height }"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
    <foreignObject v-bind="{ width, height }">
      <div
        class="fit text-bold text-center q-mt-sm grid-label"
        style="text-decoration: underline; font-size: 130%"
      >
        {{ titleText }}
      </div>
    </foreignObject>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="width - 2"
        :height="height - 2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke="white"
      />
    </g>
  </svg>
</template>
