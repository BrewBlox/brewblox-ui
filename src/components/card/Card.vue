<script setup lang="ts">
import { computed, inject, PropType, provide } from 'vue';
import { useContext, useGlobals } from '@/composables';
import { CardFooterKey } from '@/symbols';

const props = defineProps({
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
});

const { dense } = useGlobals.setup();
const { context } = useContext.setup();

const offeredFooter = inject(
  CardFooterKey,
  computed(() => null),
);
const footer = computed(() =>
  context.container === 'Dialog' ? offeredFooter.value : null,
);
// Cards inside this one have no footer of their own
provide(
  CardFooterKey,
  computed(() => null),
);

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

const toolbarClass = computed<string>(() => `toolbar__${context.container}`);

const bodyClass = computed<string[]>(() => [
  `content__${context.container}`,
  footer.value ? 'content--footer' : '',
]);

const cardStyle = computed(() => ({
  '--card-footer-height': `${(footer.value?.rows ?? 0) * 32}px`,
}));

const footerClass = computed<string>(() => `footer__${context.container}`);
</script>

<template>
  <div
    :class="cardClass"
    :style="cardStyle"
  >
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
    <div
      v-if="footer"
      :class="footerClass"
    >
      <component :is="footer.component" />
    </div>
  </div>
</template>
