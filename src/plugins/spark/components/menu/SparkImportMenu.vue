<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { makeBlockIdRules } from '@/plugins/spark/utils';
import { createDialog } from '@/utils/dialog';
import { ruleValidator, suggestId } from '@/utils/functional';
import { loadFile, saveFile } from '@/utils/import-export';
import notify from '@/utils/notify';

export default defineComponent({
  name: 'SparkImportMenu',
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
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
    } = useDialog.setup();
    const { dense } = useGlobals.setup();
    const sparkModule = sparkStore.moduleById(props.serviceId)!;
    const importBusy = ref<boolean>(false);
    const messages = ref<string[]>([]);

    async function importBlocks(values: any): Promise<void> {
      try {
        importBusy.value = true;
        messages.value = [];
        messages.value = await sparkModule.serviceImport(values);
        messages.value
          .forEach(msg => notify.info('Block import error: ' + msg, { shown: false }));
        notify.done(messages.value.length
          ? 'Block import completed with warnings. See the notification center for details.'
          : 'Block import done!');
      } catch (e) {
        notify.error(`Failed to import blocks: ${e.toString()}`);
      }
      importBusy.value = false;
    }

    const blockIdValidator = computed<(v: string) => boolean>(
      () => ruleValidator(makeBlockIdRules(props.serviceId)),
    );

    async function importSingleBlock(block: Block): Promise<void> {
      try {
        importBusy.value = true;
        messages.value = [];
        const id = suggestId(block.id ?? 'imported', blockIdValidator.value);
        await sparkStore.createBlock({
          ...block,
          id,
          nid: undefined,
          serviceId: props.serviceId,
        });
        notify.done(`Imported block <i>${id}</i>`);
      } catch (e) {
        notify.error(`Failed to import block: ${e.toString()}`);
      }
      importBusy.value = false;
    }

    function confirmImport(values: any): void {
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Reset blocks',
          message: 'This will remove all blocks, and import new ones from file. Are you sure?',
          noBackdropDismiss: true,
        },
      })
        .onOk(() => importBlocks(values));
    }

    async function startExport(): Promise<void> {
      const exported = await sparkModule.serviceExport();
      saveFile(exported, `brewblox-blocks-${props.serviceId}.json`);
    }

    function startImport(): void {
      loadFile(confirmImport);
    }

    function startImportSingle(): void {
      loadFile(importSingleBlock);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      dense,
      importBusy,
      messages,
      startExport,
      startImport,
      startImportSingle,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <ActionCardWrapper>
      <template #toolbar>
        <DialogToolbar :title="serviceId" subtitle="Import/Export blocks" />
      </template>

      <q-card-section>
        <div class="column q-gutter-y-sm">
          <q-btn
            :loading="importBusy"
            outline
            label="Import single block"
            class="col-auto full-width"
            @click="startImportSingle"
          />
          <q-btn
            :loading="importBusy"
            outline
            label="Import blocks"
            class="col-auto full-width"
            @click="startImport"
          />
          <q-btn
            :loading="importBusy"
            outline
            label="Export blocks"
            class="col-auto full-width"
            @click="startExport"
          />
        </div>
        <q-item v-if="messages.length > 0">
          <q-item-section>
            Reported problems during last import:
            <ul>
              <li v-for="(msg, idx) in messages" :key="idx">
                {{ msg }}
              </li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>
    </ActionCardWrapper>
  </q-dialog>
</template>
