<script lang="ts">
import defaults from 'lodash/defaults';
import { defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';

import { emptyGraphConfig } from '../getters';
import { GraphConfig, SharedGraphConfig } from '../types';


export default defineComponent({
  name: 'GraphEditorDialog',
  props: {
    ...useDialog.props,
    config: {
      type: Object as PropType<GraphConfig>,
      required: true,
    },
    noPeriod: {
      type: Boolean,
      default: false,
    },
    shared: {
      type: Array as PropType<SharedGraphConfig[]>,
      default: () => [],
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
    } = useDialog.setup();

    const local = ref<GraphConfig>(defaults(deepCopy(props.config), emptyGraphConfig()));

    function loadShared(): void {
      createDialog({
        title: 'Import config',
        message: 'Copy configuration from another graph',
        options: {
          type: 'radio',
          model: '',
          items: props.shared.map(shared => ({ label: shared.title, value: shared.id })),
        },
        cancel: true,
      } as any)
        .onOk(id => {
          const shared = props.shared.find(s => s.id === id);
          if (shared) {
            local.value = defaults(deepCopy(shared.config), emptyGraphConfig());
          }
        });
    }

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      loadShared,
      save,
    };
  },
});
</script>


<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <Card no-scroll>
      <template #toolbar>
        <DialogToolbar :title="title" />
      </template>

      <div class="fit column">
        <q-scroll-area class="col">
          <GraphEditor v-model:config="local" :no-period="noPeriod" />
        </q-scroll-area>
        <q-card-actions class="col-auto" style="border-top: 1px solid silver">
          <q-btn flat label="Cancel" @click="onDialogCancel" />
          <q-space />
          <q-btn :disable="shared.length === 0" flat label="Import config" @click="loadShared">
            <q-tooltip>Copy configuration from another graph</q-tooltip>
          </q-btn>
          <q-btn unelevated label="Save" color="primary" @click="save" />
        </q-card-actions>
      </div>
    </Card>
  </q-dialog>
</template>
