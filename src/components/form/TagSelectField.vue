<script lang="ts">
import { useField } from '@/composables';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'TagSelectField',
  props: {
    ...useField.props,
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    existing: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();
    const suggestions = ref<string[]>([]);

    function save(tags: string[]): void {
      emit('update:modelValue', tags);
    }

    function onInput(val, update): void {
      if (val === '') {
        update(() => (suggestions.value = []));
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        suggestions.value = props.existing
          .filter((t) => !props.modelValue.includes(t))
          .filter((t) => t.toLowerCase().match(needle))
          .slice(0, 5);
      });
    }

    return {
      activeSlots,
      suggestions,
      save,
      onInput,
    };
  },
});
</script>

<template>
  <div>
    <q-select
      :model-value="modelValue"
      multiple
      use-chips
      stack-label
      label="Tags"
      item-aligned
      use-input
      hide-dropdown-icon
      new-value-mode="add-unique"
      @update:model-value="save"
      @filter="onInput"
      @keyup.enter.stop
    >
      <template #selected-item="scope">
        <q-chip
          removable
          dense
          :tabindex="scope.tabindex"
          color="blue-grey-8"
          class="q-ma-xs"
          @remove="scope.removeAtIndex(scope.index)"
        >
          {{ scope.opt }}
        </q-chip>
      </template>
      <template
        v-for="slot in activeSlots"
        #[slot]
      >
        <slot :name="slot" />
      </template>
    </q-select>
    <LabeledField
      v-if="suggestions.length > 0"
      label="Add existing tag"
      item-aligned
    >
      <div class="row wrap q-gutter-xs">
        <q-chip
          v-for="tag in suggestions"
          :key="`suggestion-${tag}`"
          class="hoverable"
          color="blue-grey-8"
          clickable
          @click="save([...modelValue, tag])"
        >
          {{ tag }}
        </q-chip>
      </div>
    </LabeledField>
  </div>
</template>
