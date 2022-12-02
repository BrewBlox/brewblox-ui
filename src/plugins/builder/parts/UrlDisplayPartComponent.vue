<script lang="ts">
import { isAbsoluteUrl } from '@/utils/url';
import { computed, defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid, textTransformation } from '../utils';

export default defineComponent({
  name: 'UrlDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { sizeX, sizeY, bordered } = usePart.setup(props.part);

    const dimensions = computed(() => ({
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

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
      dimensions,
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
    :width="dimensions.width"
    :height="dimensions.height"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
    <g class="outline">
      <rect
        v-show="bordered"
        :width="dimensions.width - 2"
        :height="dimensions.height - 2"
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
