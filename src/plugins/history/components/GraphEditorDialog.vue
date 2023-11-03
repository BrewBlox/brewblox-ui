<script setup lang="ts">
import { GraphConfig, SharedGraphConfig } from '../types';
import { emptyGraphConfig } from '../utils';
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import cloneDeep from 'lodash/cloneDeep';
import defaults from 'lodash/defaults';
import isEqual from 'lodash/isEqual';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  config: GraphConfig;
  noPeriod?: boolean;
  shared?: SharedGraphConfig[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  noPeriod: false,
  shared: () => [],
});

defineEmits<UseDialogEmits>();

function withGraphConfigDefaults(cfg: GraphConfig): GraphConfig {
  return defaults(cloneDeep(cfg), emptyGraphConfig());
}

const { dialogRef, dialogOpts, onDialogOK, onDialogCancel } = useDialog.setup();

const initial = ref<GraphConfig>(withGraphConfigDefaults(props.config));
const local = ref<GraphConfig>(withGraphConfigDefaults(props.config));

const dirty = computed<boolean>(() => !isEqual(initial.value, local.value));

function loadShared(): void {
  createDialog({
    title: 'Import config',
    message: 'Copy configuration from another graph',
    options: {
      type: 'radio',
      model: '',
      items: props.shared.map((shared) => ({
        label: shared.title,
        value: shared.id,
      })),
    },
    cancel: true,
  } as any).onOk((id) => {
    const shared = props.shared.find((s) => s.id === id);
    if (shared) {
      local.value = withGraphConfigDefaults(shared.config);
    }
  });
}

function revert(): void {
  local.value = cloneDeep(initial.value);
}

function confirm(): void {
  if (dirty.value) {
    onDialogOK(local.value);
  } else {
    onDialogCancel();
  }
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="confirm"
    @keyup.enter="confirm"
  >
    <Card no-scroll>
      <template #toolbar>
        <Toolbar :title="title" />
      </template>

      <div class="fit column">
        <q-scroll-area class="col">
          <GraphEditor
            v-model:config="local"
            :no-period="noPeriod"
          />
        </q-scroll-area>
        <q-card-actions
          class="col-auto"
          style="border-top: 1px solid silver"
        >
          <q-btn
            :disable="!dirty"
            flat
            label="Revert"
            @click="revert"
          />
          <q-space />
          <q-btn
            v-if="shared.length > 0"
            flat
            label="Import config"
            @click="loadShared"
          >
            <q-tooltip>Copy configuration from another graph</q-tooltip>
          </q-btn>
        </q-card-actions>
      </div>
    </Card>
  </q-dialog>
</template>
