<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { deepCopy, spliceById, uniqueFilter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { prettyAny } from '@/plugins/spark/helpers';
import { deserialize } from '@/plugins/spark/parse-object';
import { sparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';

import { BlockChange, ChangeAction, EditableBlockField, QuickActionsConfig } from './types';

interface FieldDiff {
  key: string;
  oldV: string;
  newV: string;
  changed: boolean;
}

interface BlockDiff {
  id: string;
  blockId: string;
  serviceId: string;
  diffs: FieldDiff[];
}

interface ActionDisplay extends ChangeAction {
  applicable: boolean;
  active: boolean;
  diffs: BlockDiff[];
}

@Component
export default class QuickActionsBasic extends CrudComponent<QuickActionsConfig> {
  applying = false;

  get actions(): ChangeAction[] {
    return deserialize(this.config.actions ?? this.config.steps);
  }

  saveActions(actions: ChangeAction[] = this.actions): void {
    this.config.actions = actions;
    this.saveConfig();
  }

  blockByChange(change: BlockChange): Block | null {
    return sparkStore.blockById(change.serviceId, change.blockId);
  }

  get actionDisplays(): ActionDisplay[] {
    return this.actions
      .map(action => {
        const applicable = action.changes.every(change => this.blockByChange(change));
        const diffs = applicable ? action.changes.map(this.blockDiff) : [];
        const active = applicable && diffs.every(bdiff => bdiff.diffs.every(fdiff => !fdiff.changed));
        return {
          ...action,
          applicable,
          diffs,
          active,
        };
      });
  }

  confirmActionChange(block: Block, key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const specField = sparkStore.spec(block)
        .fields
        .find(field => field.key === key && !field.readonly);
      if (!specField) {
        resolve(value);
        return;
      }
      const pretty = specField.pretty ?? prettyAny;
      const field: EditableBlockField = {
        value,
        specField,
        id: uid(), // not relevant
        confirmed: true, // duh
      };

      createDialog({
        component: 'BlockFieldDialog',
        field: specField,
        address: block,
        value: field.value,
        title: `Confirm ${specField.title}`,
        html: true,
        message: `
        Please confirm the <b>${specField.title}</b> value in <i>${block.id}</i>.
        Current value is '${pretty(block.data[key])}'.
        `,
      })
        .onOk(value => resolve(value))
        .onCancel(() => reject());
    });
  }

  async applyChanges(action: ChangeAction): Promise<void> {
    const changes = action.changes;
    const actualChanges: [Block, any][] = [];
    for (const change of changes) {
      const block = this.blockByChange(change)!;
      const spec = sparkStore.spec(block);
      const actualData = deepCopy(change.data);
      for (const key in change.data) {
        if (!spec.fields.some(c => c.key === key)) {
          delete actualData[key];
        }
        if (change.confirmed?.[key]) {
          actualData[key] = await this.confirmActionChange(block, key, actualData[key]);
        }
      }
      actualChanges.push([block, actualData]);
    }
    for (const [block, actualData] of actualChanges) {
      await sparkStore.saveBlock({ ...block, data: { ...block.data, ...actualData } });
    }
    action.changes = action.changes.map((change, idx) => ({ ...change, data: actualChanges[idx][1] }));
    this.saveActions(spliceById(this.actions, action));
  }

  applyAction(action: ChangeAction): void {
    this.applying = true;
    this.applyChanges(action)
      .then(() => notify.done(`Applied ${action.name}`))
      .then(() => // Fetch all blocks to show secondary effects
        Promise.all(
          action.changes
            .map(v => v.serviceId)
            .filter(uniqueFilter)
            .map(serviceId => sparkStore.moduleById(serviceId)!.fetchBlocks())))
      .catch(e => notify.warn(`Failed to apply ${action.name}: ${e}`))
      .finally(() => this.applying = false);
  }

  showActionDialog(action: ChangeAction): void {
    this.showDialog({
      widgetProps: { active: action.id },
    });
  }

  blockDiff(change: BlockChange): BlockDiff {
    const block = this.blockByChange(change);
    if (!block) {
      return {
        id: change.id,
        serviceId: change.serviceId ?? '???',
        blockId: change.blockId ?? '???',
        diffs: [],
      };
    }

    const spec = sparkStore.spec(block);
    const diffs =
      Object.entries(change.data)
        .map(([key, val]) => {
          const specChange = spec.fields.find(s => s.key === key);
          const pretty = specChange?.pretty ?? prettyAny;
          const oldV = pretty(block.data[key]);
          const newV = pretty(val);
          return {
            key: specChange?.title ?? key,
            oldV,
            newV,
            changed: oldV !== newV,
          };
        });

    return {
      id: change.id,
      serviceId: change.serviceId,
      blockId: change.blockId!,
      diffs,
    };
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body column">
      <div
        v-for="action in actionDisplays"
        :key="action.id"
        class="row"
      >
        <div
          class="col-grow q-py-xs q-px-sm rounded-borders clickable"
          style="min-width: 100px"
          @click="showActionDialog(action)"
        >
          <div :class="action.active ? 'text-positive': ''">
            {{ action.name }}
          </div>
          <q-item-label caption class="darkened">
            {{ action.changes.length }} blocks changed
          </q-item-label>
          <q-tooltip v-if="action.applicable">
            <div class="column" style="max-width: 400px">
              <div class="col-auto text-italic" style="font-size: 120%">
                {{ action.active ? 'No fields will be changed' : 'Changes' }}
              </div>
              <div
                v-for="bdiff in action.diffs"
                :key="`bdiff-${bdiff.id}`"
                class="row q-gutter-x-sm items-baseline"
              >
                <div class="col-3 text-italic">
                  [{{ bdiff.serviceId }}] {{ bdiff.blockId }}
                </div>
                <div class="col column q-py-sm">
                  <div
                    v-for="fdiff in bdiff.diffs"
                    :key="`fdiff-${action.id}-${bdiff.id}-${fdiff.key}`"
                    class="q-gutter-x-xs"
                  >
                    <span>{{ fdiff.key }}:</span>
                    <template v-if="fdiff.changed">
                      <span class="text-negative">{{ fdiff.oldV }}</span>
                      <span>=></span>
                      <span class="text-positive">{{ fdiff.newV }}</span>
                    </template>
                    <span v-else>
                      {{ fdiff.newV }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </q-tooltip>
          <q-tooltip v-else>
            Action can't be applied. Do all changed blocks exist?
          </q-tooltip>
        </div>
        <q-btn
          flat
          round
          icon="mdi-play-circle"
          :disable="!action.applicable"
          :loading="applying"
          :color="action.active ? 'positive' : ''"
          class="col-auto q-ml-sm"
          @click="applyAction(action)"
        >
          <q-tooltip v-if="!$touch">
            Apply action <span v-if="action.active">(no fields will be changed)</span>
          </q-tooltip>
        </q-btn>
      </div>
      <slot name="below" />
    </div>
  </div>
</template>
