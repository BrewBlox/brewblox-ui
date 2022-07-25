<script lang="ts">
import { useContext, useGlobals } from '@/composables';
import { computed, defineComponent, PropType } from 'vue';

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
      <!-- With actions -->
      <div
        v-if="$slots.actions"
        class="fit column"
      >
        <q-scroll-area
          v-if="scrollable"
          :class="['col', contentClass]"
          visible
        >
          <slot />
        </q-scroll-area>
        <div
          v-else
          :class="['col', contentClass]"
        >
          <slot />
        </div>

        <div class="col-auto">
          <q-separator />
          <q-card-actions align="right">
            <slot name="actions" />
          </q-card-actions>
        </div>
      </div>

      <!-- Without actions -->
      <template v-else>
        <q-scroll-area
          v-if="scrollable"
          :class="['fit', contentClass]"
          visible
        >
          <slot />
        </q-scroll-area>
        <div
          v-else
          :class="['fit', contentClass]"
        >
          <slot />
        </div>
      </template>
    </div>
  </div>
</template>
