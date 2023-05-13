<script setup lang="ts">
import { useDialog } from '@/composables';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { computed, PropType, ref } from 'vue';

const props = defineProps({
  ...useDialog.props,
  modelValue: {
    type: null as unknown as PropType<string | null>,
    default: null,
  },
  title: {
    type: String,
    default: 'Select layout',
  },
});

defineEmits({ ...useDialog.emitsObject });

const builderStore = useBuilderStore();
const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();
const local = ref<BuilderLayout | null>(
  builderStore.layoutById(props.modelValue),
);

const layouts = computed<BuilderLayout[]>(() => builderStore.layouts);

function save(layout: BuilderLayout | null): void {
  onDialogOK(layout?.id ?? null);
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save(local)"
  >
    <DialogCard v-bind="{ title, message, html }">
      <ListSelect
        v-model="local"
        :options="layouts"
        option-value="id"
        option-label="title"
        @confirm="(v) => save(v)"
      />
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="save(local)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
