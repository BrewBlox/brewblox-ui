<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';

export default defineComponent({
  name: 'EnumValEdit',
  props: {
    ...useValEdit.props,
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    selectProps: {
      type: Object as PropType<AnyDict>,
      default: () => ({}),
    },
  },
  emits: [...useValEdit.emits],
  setup() {
    const { field, startEdit } = useValEdit.setup<string>();

    return {
      field,
      startEdit,
    };
  },
});
</script>

<template>
  <div
    v-if="editable"
    class="row no-wrap q-gutter-x-xs"
  >
    <q-select
      v-model="field"
      :options="options"
      :dense="dense"
      label="Value"
      v-bind="selectProps"
      class="col-grow"
      item-aligned
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ field }}
  </div>
</template>
