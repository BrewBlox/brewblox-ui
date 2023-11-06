<script setup lang="ts">
import {
  UseValEditEmits,
  UseValEditProps,
  useValEdit,
} from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { Link } from 'brewblox-proto/ts';
import { computed, ref } from 'vue';

type VT = Link;

const props = withDefaults(defineProps<UseValEditProps<VT>>(), {
  ...useValEdit.defaultProps<VT>(),
});

defineEmits<UseValEditEmits<VT>>();

const sparkStore = useSparkStore();
const { field, startEdit } = useValEdit.setup<Link>();

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
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayVal }}
  </div>
</template>
