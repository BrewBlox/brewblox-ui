<script setup lang="ts">
import { useDialog } from '@/composables';
import { useBlockSnippetStore, useSparkStore } from '@/plugins/spark/store';
import { createDialog } from '@/utils/dialog';
import { deserialize } from '@/utils/parsing';
import { BlockType, SetpointProfileBlock } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import { computed, PropType, ref } from 'vue';

const typeName = BlockType.SetpointProfile;

const props = defineProps({
  ...useDialog.props,
  block: {
    type: Object as PropType<SetpointProfileBlock>,
    required: true,
  },
});

defineEmits({ ...useDialog.emitsObject });

const sparkStore = useSparkStore();
const snippetStore = useBlockSnippetStore();
const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();

const selected = ref<SelectOption | null>(null);
const block = ref<SetpointProfileBlock>(cloneDeep(props.block));

const options = computed<SelectOption[]>(() =>
  snippetStore.blockSnippets
    .filter((snippet) => snippet.type === typeName)
    .map((snippet) => ({ label: snippet.name, value: snippet.id })),
);

function removeSelected(): void {
  if (selected.value === null) {
    return;
  }
  const { value } = selected.value;
  const snippet = snippetStore.snippetById(value)!;
  selected.value = null;
  snippetStore.removeSnippet(snippet);
}

function editSelected(): void {
  if (selected.value === null) {
    return;
  }
  const { value } = selected.value;
  const snippet = snippetStore.snippetById(value)!;
  createDialog({
    component: 'InputDialog',
    componentProps: {
      title: 'Edit profile name',
      modelValue: snippet.name,
    },
  }).onOk((name) => snippetStore.saveSnippet({ ...snippet, name }));
}

async function loadSelected(): Promise<void> {
  if (selected.value === null) {
    return;
  }
  const { value } = selected.value;
  const snippet = snippetStore.snippetById(value)!;
  const points = deserialize(cloneDeep(snippet.data.points));

  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Profile start',
      message: `Do you want to change '${block.value.id}' start time to now?`,
      ok: 'Yes',
      cancel: 'No',
    },
  })
    .onOk(async () => {
      await sparkStore.patchBlock(block.value, {
        points,
        start: new Date().toISOString(),
      });
      onDialogOK();
    })
    .onCancel(async () => {
      await sparkStore.patchBlock(block.value, {
        points,
      });
      onDialogOK();
    });
}

async function saveSelected(): Promise<void> {
  if (selected.value === null) {
    return;
  }
  const { value } = selected.value;
  const snippet = snippetStore.snippetById(value)!;
  snippet.data = {
    points: cloneDeep(block.value.data.points),
  };
  await snippetStore.saveSnippet(snippet);
  onDialogOK();
}

function createSnippet(): void {
  createDialog({
    component: 'InputDialog',
    componentProps: {
      modelValue: `${block.value.id} profile`,
      title: 'Save as new profile',
    },
  }).onOk(async (name: string) => {
    await snippetStore.createSnippet({
      id: nanoid(),
      name,
      type: typeName,
      data: {
        points: cloneDeep(block.value.data.points),
      },
    });
    onDialogOK();
  });
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <DialogCard v-bind="{ title, message, html }">
      <q-select
        v-model="selected"
        :options="options"
        label="Profiles"
        autofocus
        item-aligned
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey"> No results </q-item-section>
          </q-item>
        </template>
        <template
          v-if="!!selected"
          #after
        >
          <q-btn
            flat
            round
            icon="edit"
            @click="editSelected"
          >
            <q-tooltip>Rename profile</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="delete"
            @click="removeSelected"
          >
            <q-tooltip>Remove profile</q-tooltip>
          </q-btn>
        </template>
      </q-select>

      <template #actions>
        <q-btn
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          :disable="!selected"
          color="primary"
          flat
          label="load"
          @click="loadSelected"
        />
        <q-btn
          :disable="!selected"
          color="primary"
          flat
          label="save"
          @click="saveSelected"
        />
        <q-btn
          color="primary"
          flat
          label="New"
          @click="createSnippet"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
