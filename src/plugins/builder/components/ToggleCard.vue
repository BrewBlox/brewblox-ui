<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'ToggleCard',
  props: {
    settingsKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:part'],
  setup(props) {
    const { settings, patchSettings } = usePart.setup();

    const value = computed<boolean>({
      get: () =>
        Boolean(settings.value[props.settingsKey] ?? props.defaultValue),
      set: (v) => patchSettings({ [props.settingsKey]: v }),
    });

    return {
      value,
    };
  },
});
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption>
        {{ label }}
      </q-item-label>
      <q-toggle v-model="value" />
    </q-item-section>
  </q-item>
</template>
