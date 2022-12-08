<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'TextCard',
  props: {
    settingsKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Text field',
    },
  },
  emits: ['update:part'],
  setup(props) {
    const { settings, patchSettings } = usePart.setup();

    const text = computed<string>({
      get: () => settings.value[props.settingsKey] ?? '',
      set: (val) => patchSettings({ [props.settingsKey]: val }),
    });

    return {
      text,
    };
  },
});
</script>

<template>
  <InputField
    v-model="text"
    :title="label"
    :label="label"
    auto-grow
  />
</template>
