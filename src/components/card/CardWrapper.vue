<script lang="ts">
import { computed, defineComponent, inject, PropType, Ref } from 'vue';

import { WidgetContext } from '@/store/features';


export default defineComponent({
  props: {
    noScroll: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Object as PropType<WidgetContext>,
      required: true,
    },
    contentClass: {
      type: [String, Array, Object],
      default: '',
    },
  },
  setup(ctx) {
    const dense = inject<Ref<boolean>>('$dense');

    const scrollable = computed<boolean>(
      () => !ctx.noScroll && ctx.context.size === 'Fixed',
    );

    const cardClass = computed<string>(
      () => {
        const listed = [`card__${ctx.context.container} depth-2`];
        if (dense?.value) {
          listed.push('card__dense');
        }
        return listed.join(' ');
      },
    );

    const toolbarClass = computed<string>(
      () => `toolbar__${ctx.context.container}`,
    );

    const bodyClass = computed<string>(
      () => `content__${ctx.context.container}`,
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
