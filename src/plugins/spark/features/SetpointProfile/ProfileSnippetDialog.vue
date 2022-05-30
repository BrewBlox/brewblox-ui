<script lang="ts">
import { nanoid } from 'nanoid';
import { PropType, computed, defineComponent, ref } from 'vue';

import { useDialog } from '@/composables';
import { useBlockSnippetStore, useSparkStore } from '@/plugins/spark/store';
import { BlockType, SetpointProfileBlock } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/objects';
import { deserialize } from '@/utils/parsing';

const typeName = BlockType.SetpointProfile;

export default defineComponent({
  name: 'ProfileSnippetDialog',
  props: {
    ...useDialog.props,
    block: {
      type: Object as PropType<SetpointProfileBlock>,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const snippetStore = useBlockSnippetStore();
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const selected = ref<SelectOption | null>(null);
    const block = ref<SetpointProfileBlock>(deepCopy(props.block));

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
      const points = deserialize(deepCopy(snippet.data.points));

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
          block.value.data.start = new Date().getTime() / 1000;
          block.value.data.points = points;
          await sparkStore.saveBlock(block.value);
          onDialogOK();
        })
        .onCancel(async () => {
          block.value.data.points = points;
          await sparkStore.saveBlock(block.value);
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
        points: deepCopy(block.value.data.points),
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
            points: deepCopy(block.value.data.points),
          },
        });
        onDialogOK();
      });
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      selected,
      options,
      editSelected,
      removeSelected,
      loadSelected,
      saveSelected,
      createSnippet,
    };
  },
});
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
