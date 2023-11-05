<script setup lang="ts">
import {
  UseValEditEmits,
  UseValEditProps,
  useValEdit,
} from '@/plugins/spark/composables';
import { parseDate, shortDateString } from '@/utils/quantity';
import { DateString } from 'brewblox-proto/ts';
import { computed, onMounted } from 'vue';

type VT = DateString | null;

withDefaults(defineProps<UseValEditProps<VT>>(), {
  ...useValEdit.defaultProps<VT>(),
});

defineEmits<UseValEditEmits<VT>>();

const { field, startEdit } = useValEdit.setup<VT>();

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
