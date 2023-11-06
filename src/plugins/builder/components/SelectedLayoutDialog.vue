<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: string | null;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  title: 'Select layout',
});

defineEmits<UseDialogEmits>();

const builderStore = useBuilderStore();
const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<string | null>();
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
    v-bind="dialogOpts"
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
