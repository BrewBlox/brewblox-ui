<script setup lang="ts">
import { prettyConstraints } from '../../utils/formatting';
import { useValEdit } from '@/plugins/spark/composables';
import { AnalogConstraints } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'AnalogConstraintsValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [...useValEdit.emits],
  setup() {
    const { field, startEdit } = useValEdit.setup<AnalogConstraints>();

    const displayString = computed<string>(
      () => prettyConstraints(field.value) || 'Unconstrained',
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
    <div
      v-if="!comparison"
      class="text-warning q-mb-sm"
    >
      Values will replace all existing constraints on <i> {{ blockId }} </i>.
    </div>
    <AnalogConstraintsEditor
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
