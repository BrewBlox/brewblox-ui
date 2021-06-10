<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, ref } from 'vue';

import { useGlobals, useWidget } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';
import { spliceById } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';
import { prettyAny } from '@/utils/formatting';
import { uniqueFilter } from '@/utils/functional';
import { notify } from '@/utils/notify';
import { deepCopy } from '@/utils/objects';
import { deserialize } from '@/utils/parsing';

import { BlockChange, ChangeAction, EditableBlockField, QuickActionsWidget } from './types';

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

export default defineComponent({
  name: 'QuickActionsBasic',
  setup() {
    const { touch } = useGlobals.setup();
    const {
      widgetId,
      config,
      saveConfig,
    } = useWidget.setup<QuickActionsWidget>();

    const applying = ref(false);

    const actions = computed<ChangeAction[]>(
      () => deserialize(config.value.actions ?? config.value.steps),
    );

    function saveActions(values: ChangeAction[] = actions.value): void {
      config.value.actions = values;
      saveConfig();
    }

    function blockByChange(change: BlockChange): Block | null {
      return sparkStore.blockById(change.serviceId, change.blockId);
    }

    const actionDisplays = computed<ActionDisplay[]>(
      () => actions.value
        .map((action: ChangeAction): ActionDisplay => {
          const applicable = action.changes.every(change => blockByChange(change));
          const diffs = applicable ? action.changes.map(blockDiff) : [];
          const active = applicable && diffs.every(bdiff => bdiff.diffs.every(fdiff => !fdiff.changed));
          return {
            ...action,
            applicable,
            diffs,
            active,
          };
        }),
    );

    function confirmActionChange(block: Block, key: string, value: any): Promise<any> {
      return new Promise((resolve, reject) => {
        const specField = sparkStore
          .fieldSpecsByType(block.type)
          .find(field => field.key === key && !field.readonly);
        if (!specField) {
          resolve(value);
          return;
        }
        const pretty = specField.pretty ?? prettyAny;
        const field: EditableBlockField = {
          value,
          specField,
          id: nanoid(), // not relevant
          confirmed: true, // duh
        };

        createDialog({
          component: 'BlockFieldDialog',
          componentProps: {
            modelValue: field.value,
            field: specField,
            address: block,
            title: `Confirm ${specField.title}`,
            html: true,
            message: `
          Please confirm the <b>${specField.title}</b> value in <i>${block.id}</i>.
          Current value is '${pretty(block.data[key])}'.
          `,
          },
        })
          .onOk(value => resolve(value))
          .onCancel(() => reject());
      });
    }

    async function applyChanges(action: ChangeAction): Promise<void> {
      const changes = action.changes;
      const actualChanges: [Block, any][] = [];
      for (const change of changes) {
        const block = blockByChange(change)!;
        const fieldSpecs = sparkStore.fieldSpecsByType(block.type);
        const actualData = deepCopy(change.data);
        for (const key in change.data) {
          if (!fieldSpecs.some(c => c.key === key)) {
            delete actualData[key];
          }
          if (change.confirmed?.[key]) {
            actualData[key] = await confirmActionChange(block, key, actualData[key]);
          }
        }
        actualChanges.push([block, actualData]);
      }
      for (const [block, actualData] of actualChanges) {
        await sparkStore.saveBlock({ ...block, data: { ...block.data, ...actualData } });
      }
      action.changes = action.changes.map((change, idx) => ({ ...change, data: actualChanges[idx][1] }));
      spliceById(actions.value, action);
      saveActions();
    }

    function applyAction(action: ChangeAction): void {
      applying.value = true;
      applyChanges(action)
        .then(() => notify.done(`Applied ${action.name}`))
        .then(() => // Fetch all blocks to show secondary effects
          Promise.all(
            action.changes
              .map(v => v.serviceId)
              .filter(uniqueFilter)
              .map(serviceId => sparkStore.moduleById(serviceId)!.fetchBlocks())))
        .catch(e => notify.warn(`Failed to apply ${action.name}: ${e}`))
        .finally(() => applying.value = false);
    }

    function showActionDialog(action: ChangeAction): void {
      createDialog({
        component: 'WidgetDialog',
        componentProps: {
          widgetId,
          mode: 'Full',
          getProps: () => ({ active: action.id }),
        },
      });
    }

    function blockDiff(change: BlockChange): BlockDiff {
      const block = blockByChange(change);
      if (!block) {
        return {
          id: change.id,
          serviceId: change.serviceId ?? '???',
          blockId: change.blockId ?? '???',
          diffs: [],
        };
      }

      const fieldSpecs = sparkStore.fieldSpecsByType(block.type);
      const diffs =
        Object.entries(change.data)
          .map(([key, val]) => {
            const specChange = fieldSpecs.find(s => s.key === key);
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

    return {
      touch,
      applying,
      applyAction,
      actionDisplays,
      showActionDialog,
    };
  },
});
</script>

<template>
  <div>
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
          <q-tooltip v-if="!touch">
            Apply action <span v-if="action.active">(no fields will be changed)</span>
          </q-tooltip>
        </q-btn>
      </div>
      <slot name="below" />
    </div>
  </div>
</template>
