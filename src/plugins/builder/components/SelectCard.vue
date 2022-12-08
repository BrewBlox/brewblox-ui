<script lang="ts">
import isArray from 'lodash/isArray';
import { computed, defineComponent, PropType } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'SelectCard',
  props: {
    settingsKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Block',
    },
    opts: {
      type: [Array, Function] as PropType<
        SelectOption[] | (() => SelectOption[])
      >,
      required: true,
    },
  },
  emits: ['update:part'],
  setup(props) {
    const { settings, patchSettings } = usePart.setup();

    const model = computed({
      get: () => settings.value[props.settingsKey] ?? null,
      set: (v) => patchSettings({ [props.settingsKey]: v }),
    });

    const options = computed<SelectOption[]>(() => {
      if (isArray(props.opts)) {
        return props.opts;
      } else {
        return props.opts();
      }
    });

    return {
      model,
      options,
    };
  },
});
</script>

<template>
  <SelectField
    v-model="model"
    :options="options"
    :title="label"
    :label="label"
    item-aligned
  />
</template>
