<script setup lang="ts">
import { DigitalConstraints } from 'brewblox-proto/ts';
import { computed } from 'vue';
import {
  useValEdit,
  UseValEditEmits,
  UseValEditProps,
} from '@/plugins/spark/composables';
import { prettyConstraints } from '@/plugins/spark/utils/formatting';

type VT = DigitalConstraints;

withDefaults(defineProps<UseValEditProps<VT>>(), {
  ...useValEdit.defaultProps<VT>(),
});

defineEmits<UseValEditEmits<VT>>();

const { field, startEdit } = useValEdit.setup<DigitalConstraints>();

const displayString = computed<string>(
  () => prettyConstraints(field.value) || 'Unconstrained',
);
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
