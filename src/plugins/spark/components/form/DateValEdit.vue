<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { shortDateString } from '@/utils/formatting';

export default defineComponent({
  name: 'DateValEdit',
  props: {
    ...useValEdit.props,
    timeScale: {
      type: Number,
      default: 1,
    },
  },
  emits: [...useValEdit.emits],
  setup(props) {
    const { field, startEdit } = useValEdit.setup<number>();

    const scaledField = computed<number>({
      get: () => field.value * props.timeScale,
      set: (v) => (field.value = Math.round(v / props.timeScale)),
    });

    const displayVal = computed<string>(() =>
      shortDateString(scaledField.value),
    );

    onMounted(() => {
      if (scaledField.value === 0) {
        scaledField.value = new Date().getTime();
      }
    });

    return {
      scaledField,
      displayVal,
      startEdit,
    };
  },
});
</script>

<template>
  <DatetimeField
    v-if="editable"
    v-model="scaledField"
    emit-number
  />
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayVal }}
  </div>
</template>
