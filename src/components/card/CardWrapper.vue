<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext, useGlobals } from '@/composables';


export default defineComponent({
  name: 'CardWrapper',
  props: {
    noScroll: {
      type: Boolean,
      default: false,
    },
    contentClass: {
      type: [String, Array, Object],
      default: '',
    },
  },
  setup(props) {
    const { dense } = useGlobals.setup();
    const { context } = useContext.setup();

    const scrollable = computed<boolean>(
      () => !props.noScroll && context.size === 'Fixed',
    );

    const cardClass = computed<string>(
      () => {
        const listed = [`card__${context.container} depth-2`];
        if (dense.value) {
          listed.push('card__dense');
        }
        return listed.join(' ');
      },
    );

    const toolbarClass = computed<string>(
      () => `toolbar__${context.container}`,
    );

    const bodyClass = computed<string>(
      () => `content__${context.container}`,
    );

    return {
      scrollable,
      cardClass,
      toolbarClass,
      bodyClass,
    };
  },
});
</script>

<template>
  <div :class="cardClass">
    <div :class="toolbarClass">
      <slot name="toolbar" />
    </div>
    <div :class="bodyClass">
      <component
        :is="scrollable ? 'q-scroll-area' : 'div'"
        :class="['fit', contentClass]"
        visible
      >
        <slot />
      </component>
    </div>
  </div>
</template>
