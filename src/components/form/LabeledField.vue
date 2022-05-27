<script lang="ts">
import { QField } from 'quasar';
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';

import { useField } from '@/composables';
import { fixedNumber } from '@/utils/formatting';

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
  emits: ['click'],
  setup(props, { slots, emit }) {
    const fieldRef = ref<QField>();
    const { activeSlots } = useField.setup();

    const displayValue = computed<string>(() => {
      if (slots.control || slots.default) {
        return ''; // parent has custom implementation
      }
      if (props.modelValue == null || props.modelValue === '') {
        return '<not set>';
      }
      return props.number
        ? fixedNumber(props.modelValue, props.decimals)
        : `${props.modelValue}`;
    });

    onMounted(() => {
      if (fieldRef.value) {
        // Quasar fields have changed to use inheritAttrs: false,
        // and do not have a click event handler
        // We can bypass this by setting the click handler on the top-level html element
        fieldRef.value.$el.onclick = () => emit('click');
      }
    });

    return {
      fieldRef,
      activeSlots,
      displayValue,
    };
  },
});
</script>

<template>
  <q-field
    ref="fieldRef"
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
          <small
            v-if="!!suffix"
            class="q-ml-xs darkish"
          >
            {{ suffix }}
          </small>
        </component>
      </slot>
    </template>

    <template
      v-for="slot in activeSlots"
      #[slot]
    >
      <slot :name="slot" />
    </template>

    <q-tooltip v-if="tooltip">
      {{ tooltip }}
    </q-tooltip>
  </q-field>
</template>
