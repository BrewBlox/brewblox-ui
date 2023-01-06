<script lang="ts">
import { createDialog } from '@/utils/dialog';
import isArray from 'lodash/isArray';
import { computed, defineComponent, PropType } from 'vue';
import { usePart } from '../../composables';

export default defineComponent({
  name: 'SelectMenuContent',
  props: {
    settingsKey: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    opts: {
      type: [Array, Function] as PropType<
        SelectOption[] | (() => SelectOption[])
      >,
      required: true,
    },
    default: {
      type: null as unknown as PropType<any>,
      default: null,
    },
  },
  setup(props) {
    const { settings, patchSettings } = usePart.setup();

    const model = computed(
      () => settings.value[props.settingsKey] ?? props.default,
    );

    const options = computed<SelectOption[]>(() => {
      if (isArray(props.opts)) {
        return props.opts;
      } else {
        return props.opts();
      }
    });

    const modelLabel = computed<string>(
      () => options.value.find((opt) => opt.value === model.value)?.label ?? '',
    );

    function edit(): void {
      createDialog({
        component: 'SelectDialog',
        componentProps: {
          modelValue: model.value,
          title: props.title,
          message: props.message,
          selectOptions: options.value,
          selectProps: {
            label: props.label,
          },
        },
      }).onOk((v) => patchSettings({ [props.settingsKey]: v }));
    }

    return {
      model,
      modelLabel,
      edit,
    };
  },
});
</script>

<template>
  <q-item
    v-close-popup
    clickable
    @click="edit"
  >
    <q-item-section>{{ label }}</q-item-section>
    <q-item-section side> {{ modelLabel }} </q-item-section>
  </q-item>
</template>
