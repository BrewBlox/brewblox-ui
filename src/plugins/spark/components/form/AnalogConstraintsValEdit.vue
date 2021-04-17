<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { prettifyConstraints } from '@/plugins/spark/utils';
import { AnalogConstraintsObj } from '@/shared-types';

export default defineComponent({
  name: 'AnalogConstraintsValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [
    ...useValEdit.emits,
  ],
  setup() {
    const { field, startEdit } = useValEdit.setup<AnalogConstraintsObj>();

    const displayString = computed<string>(
      () => prettifyConstraints(field.value),
    );

    return {
      field,
      displayString,
      startEdit,
    };
  },
});
</script>

<template>
  <div v-if="editable">
    <div v-if="!comparison" class="text-warning q-mb-sm">
      Values will replace all existing constraints on <i>{{ blockId }}</i>.
    </div>
    <AnalogConstraints
      v-model="field"
      v-bind="{serviceId}"
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayString }}
  </div>
</template>
