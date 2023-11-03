<script setup lang="ts">
import { useValEdit } from '@/plugins/spark/composables';
import { prettyConstraints } from '@/plugins/spark/utils/formatting';
import { DigitalConstraints } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'DigitalConstraintsValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [...useValEdit.emits],
  setup() {
    const { field, startEdit } = useValEdit.setup<DigitalConstraints>();

    const displayString = computed<string>(
      () => prettyConstraints(field.value) || 'Unconstrained',
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
    <div
      v-if="!comparison"
      class="text-warning q-mb-sm"
    >
      Values will replace all existing constraints on
      <i> {{ blockId }} </i>.
    </div>
    <DigitalConstraintsEditor
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
