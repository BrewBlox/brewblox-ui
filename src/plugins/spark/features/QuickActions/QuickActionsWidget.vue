<script lang="ts">
import isEmpty from 'lodash/isEmpty';
import { nanoid } from 'nanoid';
import { computed, defineComponent, onBeforeMount } from 'vue';

import { useContext, useWidget } from '@/composables';
import { TempUnit } from '@/shared-types';
import { systemStore } from '@/store/system';
import { bloxQty, isQuantity } from '@/utils/bloxfield';
import { createDialog } from '@/utils/dialog';
import { deserialize } from '@/utils/parsing';

import QuickActionsBasic from './QuickActionsBasic.vue';
import QuickActionsFull from './QuickActionsFull.vue';
import { ChangeAction, QuickActionsWidget } from './types';

export default defineComponent({
  name: 'QuickActionsWidget',
  components: {
    Basic: QuickActionsBasic,
    Full: QuickActionsFull,
  },
  props: {
    activeId: {
      type: String,
      default: null,
    },
  },
  setup() {
    const { context } = useContext.setup();
    const {
      config,
      saveConfig,
    } = useWidget.setup<QuickActionsWidget>();

    const systemTemp = computed<TempUnit>(
      () => systemStore.units.temperature,
    );

    const otherTemp = computed<TempUnit>(
      () => systemTemp.value === 'degC' ? 'degF' : 'degC',
    );

    const actions = computed<ChangeAction[]>(
      () => deserialize(config.value.actions ?? config.value.steps),
    );

    function saveActions(acs: ChangeAction[] = actions.value): void {
      config.value.actions = acs;
      config.value.steps = undefined;
      saveConfig();
    }

    onBeforeMount(() => {
      let dirty = false;

      // Change IDs were added after initial release
      actions.value.forEach(action =>
        action.changes
          .filter(change => change.id === undefined)
          .forEach(change => {
            change.id = nanoid();
            dirty = true;
          }));

      // Service IDs became a key of individual changes
      actions.value.forEach(action =>
        action.changes
          .filter(change => change.serviceId === undefined)
          .forEach(change => {
            change.serviceId = config.value.serviceId!;
            dirty = true;
          }));

      // 'steps' field was renamed to 'actions'
      dirty = dirty || config.value.steps !== undefined;

      // Convert units if user changed system temperature
      actions.value.forEach(action =>
        action.changes.forEach(change => {
          const updates: AnyDict = {};
          for (let key in change.data) {
            const value = change.data[key];
            if (isQuantity(value) && value.unit.includes(otherTemp.value)) {
              updates[key] = bloxQty(value).to(value.unit.replace(otherTemp.value, systemTemp.value));
            }
          }
          if (!isEmpty(updates)) {
            dirty = true;
            change.data = {
              ...change.data,
              ...updates,
            };
          }
        }),
      );

      // Save if dirty
      if (dirty) {
        config.value.serviceIdMigrated = true;
        config.value.changeIdMigrated = true;
        saveActions();
      }
    });

    function addAction(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          title: 'Add an action',
          message: 'Actions let you immediately set multiple block fields to predetermined values.',
          modelValue: 'New action',
        },
      })
        .onOk(name => {
          actions.value.push({ name, id: nanoid(), changes: [] });
          saveActions();
        });
    }

    return {
      context,
      actions,
      addAction,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle>
        <template #menus>
          <WidgetActions>
            <ExportAction />
          </WidgetActions>
        </template>
      </WidgetToolbar>
    </template>
    <component :is="context.mode" :active-id="activeId">
      <template v-if="actions.length === 0" #warnings>
        <div class="text-italic text-h6 q-pa-md darkened text-center">
          Create an action to get started.
        </div>
      </template>
      <template #below>
        <q-btn
          flat
          dense
          color="secondary"
          icon="add"
          label="New action"
          class="self-end"
          @click="addAction"
        />
      </template>
    </component>
  </Card>
</template>
