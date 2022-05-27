<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useContext, useGlobals } from '@/composables';

export default defineComponent({
  name: 'Card',
  props: {
    noScroll: {
      type: Boolean,
      default: false,
    },
    contentClass: {
      type: [String, Array, Object],
      default: '',
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
    },
  },
  setup(props) {
    const { dense } = useGlobals.setup();
    const { context } = useContext.setup();

    const scrollable = computed<boolean>(
      () => !props.noScroll && context.size === 'Fixed',
    );

    const cardClass = computed<string>(() => {
      const listed = [
        `card__${context.container}`,
        `card__${props.size}`,
        'depth-2',
      ];
      if (dense.value) {
        listed.push('card__dense');
      }
      if (props.noScroll) {
        listed.push('card__no-scroll');
      }
      return listed.join(' ');
    });

    const toolbarClass = computed<string>(
      () => `toolbar__${context.container}`,
    );

    const bodyClass = computed<string>(() => `content__${context.container}`);

    const contentComponent = computed<string>(() =>
      scrollable.value ? 'q-scroll-area' : 'div',
    );

    return {
      scrollable,
      cardClass,
      toolbarClass,
      bodyClass,
      contentComponent,
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
      <!-- With actions -->
      <div
        v-if="$slots.actions"
        class="fit column"
      >
        <component
          :is="contentComponent"
          :class="['col', contentClass]"
          visible
        >
          <slot />
        </component>
        <div class="col-auto">
          <q-separator />
          <q-card-actions align="right">
            <slot name="actions" />
          </q-card-actions>
        </div>
      </div>

      <!-- Without actions -->
      <component
        :is="contentComponent"
        v-else
        :class="['fit', contentClass]"
        visible
      >
        <slot />
      </component>
    </div>
  </div>
</template>
