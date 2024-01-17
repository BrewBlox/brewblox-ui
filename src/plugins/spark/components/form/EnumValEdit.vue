<script setup lang="ts">
import {
  useValEdit,
  UseValEditEmits,
  UseValEditProps,
} from '@/plugins/spark/composables';

type VT = string;

interface Props extends UseValEditProps<VT> {
  options: SelectOption<VT>[];
  selectProps?: AnyDict;
}

withDefaults(defineProps<Props>(), {
  ...useValEdit.defaultProps<VT>(),
  selectProps: () => ({}),
});

defineEmits<UseValEditEmits<VT>>();

const { field, startEdit } = useValEdit.setup<string>();
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
