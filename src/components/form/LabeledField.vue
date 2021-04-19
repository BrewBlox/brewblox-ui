<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { round } from '@/utils/functional';

export default defineComponent({
  name: 'LabeledField',
  props: {
    ...useField.props,
    modelValue: {
      type: [String, Number, Boolean, Array, Object, Date] as PropType<any>,
      default: null,
    },
    number: {
      type: Boolean,
      default: false,
    },
    suffix: {
      type: String,
      default: '',
    },
    decimals: {
      type: Number,
      default: 2,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const { activeSlots } = useField.setup();

    const displayValue = computed<string>(
      () => {
        if (slots.control || slots.default) {
          return ''; // parent has custom implementation
        }
        if (props.modelValue == null || props.modelValue === '') {
          return '<not set>';
        }
        return props.number
          ? round(props.modelValue, props.decimals)
          : `${props.modelValue}`;
      },
    );

    return {
      activeSlots,
      displayValue,
    };
  },
});
</script>

<template>
  <q-field
    :class="['rounded-borders q-px-sm', !readonly && 'depth-1 pointer']"
    borderless
    label-slot
    stack-label
  >
    <template #label>
      <slot name="label">
        {{ label }}
      </slot>
    </template>

    <template #control>
      <slot name="control">
        <component
          :is="tag"
          :class="['q-mt-sm', tagClass]"
          :style="tagStyle"
        >
          <slot>
            {{ displayValue }}
          </slot>
          <small v-if="!!suffix" class="q-ml-xs darkish">{{ suffix }}</small>
        </component>
      </slot>
    </template>

    <template v-for="slot in activeSlots" #[slot] :name="slot" />

    <q-tooltip v-if="tooltip">
      {{ tooltip }}
    </q-tooltip>
  </q-field>
</template>
