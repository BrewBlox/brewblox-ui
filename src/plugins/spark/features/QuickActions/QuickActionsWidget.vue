<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent, onBeforeMount } from 'vue';

import { useContext, useWidget } from '@/composables';
import { deserialize } from '@/plugins/spark/parse-object';
import { createDialog } from '@/utils/dialog';

import QuickActionsBasic from './QuickActionsBasic.vue';
import QuickActionsFull from './QuickActionsFull.vue';
import { ChangeAction, QuickActionsConfig } from './types';

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
    } = useWidget.setup<QuickActionsConfig>();

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
      // Config field was renamed to 'actions'
      dirty = dirty || !!config.value.steps;
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
  <CardWrapper>
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
  </CardWrapper>
</template>
