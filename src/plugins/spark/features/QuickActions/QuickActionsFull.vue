<script setup lang="ts">
import QuickActionChange from './QuickActionChange.vue';
import { BlockChange, ChangeAction, QuickActionsWidget } from './types';
import { useGlobals, useWidget } from '@/composables';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { filterById, spliceById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';
import { deserialize } from '@/utils/parsing';
import { Block } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import { computed, ref } from 'vue';

defineProps({
  activeId: {
    type: String,
    default: null,
  },
});

const sparkStore = useSparkStore();
const specStore = useBlockSpecStore();
const { dense } = useGlobals.setup();
const { config, patchConfig } = useWidget.setup<QuickActionsWidget>();
const draggingStep = ref(false);

const actions = computed<ChangeAction[]>(() =>
  deserialize(config.value.actions),
);

function saveActions(acs: ChangeAction[]): void {
  patchConfig({ actions: acs });
}

function saveAction(action: ChangeAction): void {
  saveActions(spliceById([...actions.value], action));
}

function duplicateAction(action: ChangeAction): void {
  saveActions([
    ...actions.value,
    {
      id: nanoid(),
      name: `${action.name} (copy)`,
      changes: action.changes.map((change) => ({
        ...cloneDeep(change),
        id: nanoid(),
      })),
    },
  ]);
}

function renameAction(action: ChangeAction): void {
  const stepName = action.name;
  createDialog({
    component: 'TextDialog',
    componentProps: {
      modelValue: stepName,
      title: 'Change ChangeAction name',
      message: `Choose a new name for '${action.name}'`,
    },
  }).onOk((name) => {
    if (name !== stepName) {
      saveAction({ ...action, name });
    }
  });
}

function startRemoveStep(action: ChangeAction): void {
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Remove ChangeAction',
      message: `Are you sure you want to remove ${action.name}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    },
  }).onOk(() => saveActions(filterById(actions.value, action)));
}

function startAddChange(action: ChangeAction): void {
  createDialog({
    component: 'BlockAddressDialog',
    componentProps: {
      modelValue: {
        id: null,
        serviceId: null,
        type: null,
      },
      title: 'Choose a Block',
      anyService: true,
      clearable: false,
      blockFilter: (block: Block) =>
        specStore.fieldSpecsByType(block.type).some((f) => !f.readonly),
    },
  }).onOk((addr: BlockAddress) => {
    if (addr && addr.id && addr.serviceId) {
      action.changes.push({
        id: nanoid(),
        blockId: addr.id,
        serviceId: addr.serviceId,
        data: {},
        confirmed: {},
      });
      saveAction(action);
    }
  });
}

function saveChanges(action: ChangeAction, changes: BlockChange[]): void {
  action.changes = changes;
  saveAction(action);
}

function saveChange(action: ChangeAction, change: BlockChange): void {
  spliceById(action.changes, change);
  saveAction(action);
}

function removeChange(action: ChangeAction, change: BlockChange): void {
  spliceById(action.changes, change, false);
  saveAction(action);
}

function startSwitchBlock(action: ChangeAction, change: BlockChange): void {
  const { serviceId, blockId } = change;
  const currentBlock = sparkStore.blockById(serviceId, blockId);
  createDialog({
    component: 'BlockAddressDialog',
    componentProps: {
      modelValue: currentBlock,
      title: `Switch target block '${blockId}'`,
      anyService: true,
      blockFilter: (block) =>
        currentBlock === null || block.type === currentBlock.type,
    },
  }).onOk((addr: BlockAddress) => {
    if (addr && addr.id && addr.serviceId) {
      change.blockId = addr.id;
      change.serviceId = addr.serviceId;
      saveChange(action, change);
    }
  });
}
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body column">
      <vue-draggable
        v-if="actions.length > 0"
        :disabled="dense"
        :model-value="actions"
        item-key="id"
        @update:model-value="saveActions"
        @start="draggingStep = true"
        @end="draggingStep = false"
      >
        <template #item="action">
          <q-expansion-item
            :label="action.element.name"
            :default-opened="activeId === action.element.id"
            :disable="draggingStep"
            header-style="font-size: 120%"
            group="actions"
            icon="mdi-format-list-checks"
            class="action-container q-mr-md q-mb-sm depth-1"
          >
            <vue-draggable
              :disabled="dense"
              :model-value="action.element.changes"
              item-key="id"
              @update:model-value="(v) => saveChanges(action.element, v)"
            >
              <template #item="change">
                <QuickActionChange
                  :model-value="change.element"
                  class="q-mr-sm q-my-sm"
                  @update:model-value="(v) => saveChange(action.element, v)"
                  @remove="removeChange(action.element, change.element)"
                  @switch="startSwitchBlock(action.element, change.element)"
                />
              </template>
            </vue-draggable>
            <div class="row justify-end q-px-md q-py-sm action-actions">
              <q-btn
                size="sm"
                label="Add Block"
                icon="mdi-cube"
                flat
                @click="startAddChange(action.element)"
              />
              <q-btn
                size="sm"
                label="Copy"
                icon="file_copy"
                flat
                @click="duplicateAction(action.element)"
              />
              <q-btn
                size="sm"
                label="Rename"
                icon="edit"
                flat
                @click="renameAction(action.element)"
              />
              <q-btn
                size="sm"
                label="Remove"
                icon="delete"
                flat
                @click="startRemoveStep(action.element)"
              />
            </div>
          </q-expansion-item>
        </template>
      </vue-draggable>
      <slot name="below" />
    </div>
  </div>
</template>

<style scoped>
.action-container:nth-child(odd) {
  border-left: 2px solid dodgerblue;
}
.action-container:nth-child(even) {
  border-left: 2px solid red;
}
</style>
