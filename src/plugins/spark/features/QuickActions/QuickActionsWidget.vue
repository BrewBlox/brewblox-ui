<script lang="ts">
import { useContext, useWidget } from '@/composables';
import { userUnits } from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { isQuantity } from '@/utils/identity';
import { notify } from '@/utils/notify';
import { deserialize } from '@/utils/parsing';
import { bloxQty, prettyUnit } from '@/utils/quantity';
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import { computed, defineComponent } from 'vue';
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
    const { config, patchConfig } = useWidget.setup<QuickActionsWidget>();

    const actions = computed<ChangeAction[]>(() =>
      deserialize(config.value.actions),
    );

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
        patchConfig({
          actions: [...actions.value, { name, id: nanoid(), changes: [] }],
        });
      });
    }

    function convertUnits(): void {
      let dirty = false;
      const userTemp = userUnits.value.temperature;
      const otherTemp = userTemp === 'degC' ? 'degF' : 'degC';

      const actions = cloneDeep(config.value.actions);

      // Convert units if user changed system temperature
      actions.forEach((action) =>
        action.changes.forEach((change) => {
          Object.keys(change.data).forEach((key) => {
            const value = change.data[key];
            if (isQuantity(value) && value.unit.includes(otherTemp)) {
              dirty = true;
              change.data[key] = bloxQty(value)
                .to(value.unit.replace(otherTemp, userTemp))
                .toJSON();
            }
          });
        }),
      );

      notify.done(`Converted temperature units to ${prettyUnit(userTemp)}`);

      if (dirty) {
        patchConfig({ actions });
      }
    }

    return {
      context,
      actions,
      addAction,
      convertUnits,
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
            <ActionItem
              icon="mdi-swap-horizontal-bold"
              label="Convert temperature units"
              @click="convertUnits"
            />
          </WidgetActions>
        </template>
      </WidgetToolbar>
    </template>
    <component
      :is="context.mode"
      :active-id="activeId"
    >
      <template
        v-if="actions.length === 0"
        #warnings
      >
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
