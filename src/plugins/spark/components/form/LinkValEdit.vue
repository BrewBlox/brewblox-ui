<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils';
import { Link } from '@/shared-types';

export default defineComponent({
  name: 'LinkValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [...useValEdit.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const { field, startEdit } = useValEdit.setup<Link>(props.modelValue);

    const blockIdOpts = computed<string[]>(() =>
      sparkStore
        .blocksByService(props.serviceId)
        .filter((block) => isCompatible(block.type, field.value.type))
        .map((block) => block.id),
    );

    const filteredOpts = ref<string[]>(blockIdOpts.value);

    const displayVal = computed<string>(() => field.value.id || '<None>');

    function filterFn(val, update): void {
      if (val === '') {
        update(() => (filteredOpts.value = blockIdOpts.value));
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        filteredOpts.value = blockIdOpts.value.filter((opt) =>
          opt.toLowerCase().match(needle),
        );
      });
    }

    return {
      field,
      startEdit,
      filteredOpts,
      displayVal,
      filterFn,
    };
  },
});
</script>

<template>
  <q-select
    v-if="editable"
    v-model="field.id"
    :options="filteredOpts"
    label="Block"
    dense
    clearable
    use-input
    item-aligned
    @filter="filterFn"
  />
  <div v-else class="clickable q-pa-sm rounded-borders" @click="startEdit">
    {{ displayVal }}
  </div>
</template>
