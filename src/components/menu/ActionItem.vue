<script setup lang="ts">
import { computed, useAttrs } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  tooltip: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
  noClose: {
    type: Boolean,
    default: false,
  },
  itemProps: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  click: [evt: MouseEvent | TouchEvent];
}>();

const attrs = useAttrs();

const combinedProps = computed<AnyDict>(() => ({
  clickable: !props.disabled,
  active: props.active && !props.disabled,
  ...props.itemProps,
  ...attrs,
}));

function onClick(evt: Event): void {
  if (!props.disabled) {
    emit('click', evt as MouseEvent | TouchEvent);
  }
}
</script>

<template>
  <q-item
    v-close-popup="noClose || disabled ? 0 : 1"
    v-bind="combinedProps"
    :class="{ darkened: disabled }"
    @click="onClick"
  >
    <q-tooltip v-if="tooltip && !disabled">
      {{ tooltip }}
    </q-tooltip>
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section v-if="label">
      {{ label }}
    </q-item-section>
    <slot />
  </q-item>
</template>
