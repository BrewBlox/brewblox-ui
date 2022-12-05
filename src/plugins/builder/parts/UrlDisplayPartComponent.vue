<script lang="ts">
import { isAbsoluteUrl } from '@/utils/url';
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { usePart } from '../composables';
import { textTransformation } from '../utils';

export default defineComponent({
  name: 'UrlDisplayPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const { bordered } = usePart.setup(props.part);

    const url = computed<string>(() => props.part.settings['url'] || '');

    const titleText = computed<string>(
      () => props.part.settings['text'] || url.value || 'Url Display',
    );

    function interact(): void {
      const { url } = props.part.settings;
      if (url) {
        if (isAbsoluteUrl(url)) {
          window.open(url, '_blank');
        } else {
          useRouter().push(url);
        }
      }
    }

    return {
      textTransformation,
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
    :width="width"
    :height="height"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
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
    <foreignObject class="fit">
      <div
        class="fit text-bold text-center q-mt-sm grid-label"
        style="text-decoration: underline; font-size: 130%"
      >
        {{ titleText }}
      </div>
    </foreignObject>
  </svg>
</template>
