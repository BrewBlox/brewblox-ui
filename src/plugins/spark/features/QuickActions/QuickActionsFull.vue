<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { deepCopy, filterById, spliceById } from '@/helpers/functional';
import { deserialize } from '@/plugins/spark/parse-object';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';

import QuickActionChange from './QuickActionChange.vue';
import { BlockChange, ChangeAction, QuickActionsConfig } from './types';

@Component({
  components: {
    QuickActionChange,
  },
})
export default class QuickActionsFull extends CrudComponent<QuickActionsConfig> {
  draggingStep = false;
  editableChanges: Mapped<boolean> = {};

  @Prop({ type: String })
  readonly activeId!: string;

  get defaultServiceId(): string | null {
    return this.config.serviceId ?? null;
  }

  get actions(): ChangeAction[] {
    return deserialize(this.config.actions ?? this.config.steps);
  }

  saveActions(actions: ChangeAction[] = this.actions): void {
    this.config.actions = actions;
    this.saveConfig();
  }

  saveAction(action: ChangeAction): void {
    spliceById(this.actions, action);
    this.saveActions();
  }

  duplicateAction(action: ChangeAction): void {
    this.actions.push({
      id: uid(),
      name: `${action.name} (copy)`,
      changes: action.changes.map(change => ({ ...deepCopy(change), id: uid() })),
    });
    this.saveActions();
  }

  renameAction(action: ChangeAction): void {
    const stepName = action.name;
    createDialog({
      component: 'InputDialog',
      title: 'Change ChangeAction name',
      message: `Choose a new name for '${action.name}'`,
      value: stepName,
    })
      .onOk(newName => {
        if (newName !== stepName) {
          action.name = newName;
          this.saveAction(action);
        }
      });
  }

  startRemoveStep(action: ChangeAction): void {
    createDialog({
      title: 'Remove ChangeAction',
      message: `Are you sure you want to remove ${action.name}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => this.saveActions(filterById(this.actions, action)));
  }

  startAddChange(action: ChangeAction): void {
    createDialog({
      component: 'BlockAddressDialog',
      title: 'Choose a Block',
      value: {
        id: null,
        serviceId: null,
        type: null,
      },
      anyService: true,
      clearable: false,
      blockFilter: block => !!sparkStore.spec(block)?.fields.some(f => !f.readonly),
    })
      .onOk((addr: BlockAddress) => {
        if (addr && addr.id && addr.serviceId) {
          action.changes.push({
            id: uid(),
            blockId: addr.id,
            serviceId: addr.serviceId,
            data: {},
            confirmed: {},
          });
          this.saveAction(action);
        }
      });
  }

  saveChanges(action: ChangeAction, changes: BlockChange[]): void {
    action.changes = changes;
    this.saveAction(action);
  }

  saveChange(action: ChangeAction, change: BlockChange): void {
    spliceById(action.changes, change);
    this.saveAction(action);
  }

  removeChange(action: ChangeAction, change: BlockChange): void {
    spliceById(action.changes, change, false);
    this.saveAction(action);
  }

  startSwitchBlock(action: ChangeAction, change: BlockChange): void {
    const { serviceId, blockId } = change;
    const currentBlock = sparkStore.blockById(serviceId, blockId);
    createDialog({
      component: 'BlockAddressDialog',
      title: `Switch target block '${blockId}'`,
      value: currentBlock,
      anyService: true,
      blockFilter: block => currentBlock === null || block.type === currentBlock.type,
    })
      .onOk((addr: BlockAddress) => {
        if (addr && addr.id && addr.serviceId) {
          change.blockId = addr.id;
          change.serviceId = addr.serviceId;
          this.saveChange(action, change);
        }
      });
  }
}
</script>

<template>
  <div class="widget-lg">
    <slot name="warnings" />

    <div class="widget-body column">
      <draggable
        v-if="actions.length > 0"
        :disabled="$dense"
        :value="actions"
        @input="saveActions"
        @start="draggingStep=true"
        @end="draggingStep=false"
      >
        <q-expansion-item
          v-for="action in actions"
          :key="action.id"
          :label="action.name"
          :default-opened="activeId === action.id"
          :disable="draggingStep"
          header-style="font-size: 120%"
          group="actions"
          icon="mdi-format-list-checks"
          class="action-container q-mr-md q-mb-sm depth-1"
        >
          <draggable
            :disabled="$dense"
            :value="action.changes"
            @input="v => saveChanges(action, v)"
          >
            <QuickActionChange
              v-for="change in action.changes"
              :key="`change--${action.id}--${change.id}`"
              :value="change"
              class="q-mr-sm q-my-sm"
              @input="saveChange(action, change)"
              @remove="removeChange(action, change)"
              @switch="startSwitchBlock(action, change)"
            />
          </draggable>
          <div class="row justify-end q-px-md q-py-sm action-actions">
            <q-btn
              size="sm"
              label="Add Block"
              icon="mdi-cube"
              flat
              @click="startAddChange(action)"
            />
            <q-btn
              size="sm"
              label="Copy"
              icon="file_copy"
              flat
              @click="duplicateAction(action)"
            />
            <q-btn
              size="sm"
              label="Rename"
              icon="edit"
              flat
              @click="renameAction(action)"
            />
            <q-btn
              size="sm"
              label="Remove"
              icon="delete"
              flat
              @click="startRemoveStep(action)"
            />
          </div>
        </q-expansion-item>
      </draggable>
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
