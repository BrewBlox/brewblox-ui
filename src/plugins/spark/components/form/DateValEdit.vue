<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { DateString } from '@/shared-types';
import { shortDateString } from '@/utils/quantity';

export default defineComponent({
  name: 'DateValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [...useValEdit.emits],
  setup() {
    const { field, startEdit } = useValEdit.setup<DateString | null>();

    const displayVal = computed<string>(() => shortDateString(field.value));

    onMounted(() => {
      if (field.value == null) {
        field.value = new Date().toISOString();
      }
    });

    return {
      field,
      displayVal,
      startEdit,
    };
  },
});
</script>

<template>
  <DatetimeField
    v-if="editable"
    v-model="field"
  />
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayVal }}
  </div>
</template>
