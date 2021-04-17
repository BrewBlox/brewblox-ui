<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'ActionItem',
  props: {
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
  },
  emits: [
    'click',
  ],
  setup(props, { attrs, emit }) {
    const combinedProps = computed<AnyDict>(
      () => ({
        clickable: !props.disabled,
        active: props.active && !props.disabled,
        ...props.itemProps,
        ...attrs,
      }),
    );

    function onClick(): void {
      if (!props.disabled) {
        emit('click');
      }
    }

    return {
      combinedProps,
      onClick,
    };
  },
});
</script>

<template>
  <q-item
    v-close-popup="noClose || disabled ? 0 : 1"
    v-bind="combinedProps"
    :class="{darkened: disabled}"
    @click="onClick"
  >
    <q-tooltip v-if="tooltip && !disabled">
      {{ tooltip }}
    </q-tooltip>
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
    <slot />
  </q-item>
</template>
