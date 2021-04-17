<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { prettifyConstraints } from '@/plugins/spark/utils';
import { DigitalConstraintsObj } from '@/shared-types';

export default defineComponent({
  name: 'DigitalConstraintsValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [
    ...useValEdit.emits,
  ],
  setup() {
    const { field, startEdit } = useValEdit.setup<DigitalConstraintsObj>();

    const displayString = computed<string>(
      () => prettifyConstraints(field.value),
    );

    return {
      field,
      startEdit,
      displayString,
    };
  },
});
</script>

<template>
  <div v-if="editable">
    <div v-if="!comparison" class="text-warning q-mb-sm">
      Values will replace all existing constraints on <i>{{ blockId }}</i>.
    </div>
    <DigitalConstraints
      v-model="field"
      :service-id="serviceId"
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
