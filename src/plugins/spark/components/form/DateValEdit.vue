<script lang="ts">
import { useValEdit } from '@/plugins/spark/composables';
import { parseDate, shortDateString } from '@/utils/quantity';
import { DateString } from 'brewblox-proto/ts';
import { computed, defineComponent, onMounted } from 'vue';

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

    const date = computed<Date>({
      get: () => parseDate(field.value) ?? new Date(),
      set: (v: Date) => (field.value = v.toISOString()),
    });

    return {
      date,
      displayVal,
      startEdit,
    };
  },
});
</script>

<template>
  <DatetimeField
    v-if="editable"
    v-model="date"
  />
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayVal }}
  </div>
</template>
