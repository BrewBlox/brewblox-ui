<script lang="ts">
import { nanoid } from 'nanoid';
import { computed, defineComponent } from 'vue';

import { useContext, useWidget } from '@/composables';
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
    const { config, saveConfig } = useWidget.setup<QuickActionsWidget>();

    const actions = computed<ChangeAction[]>(() =>
      deserialize(config.value.actions),
    );

    function saveActions(acs: ChangeAction[] = actions.value): void {
      config.value.actions = acs;
      saveConfig();
    }

    function addAction(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          title: 'Add an action',
          message:
            'Actions let you immediately set multiple block fields to predetermined values.',
          modelValue: 'New action',
        },
      }).onOk((name) => {
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
