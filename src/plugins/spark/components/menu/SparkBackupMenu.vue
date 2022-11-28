<script lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { createDialogPromise } from '@/utils/dialog';
import { loadFile, saveFile } from '@/utils/import-export';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'SparkBackupMenu',
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel } =
      useDialog.setup();
    const { dense } = useGlobals.setup();
    const sparkStore = useSparkStore();
    const busy = ref<boolean>(false);

    const selectedStoredBackup = ref<string>();
    const storedBackupNames = ref<string[]>([]);
    const messages = ref<string[]>([]);

    async function reloadStoredBackups(): Promise<void> {
      storedBackupNames.value = await sparkStore.storedBackupAll(
        props.serviceId,
      );
    }

    async function confirmImport(): Promise<boolean> {
      const retv = await createDialogPromise({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Reset blocks',
          message:
            'This will remove all blocks, and import new ones from the backup. Are you sure?',
          noBackdropDismiss: true,
        },
      });
      return retv ?? false;
    }

    onMounted(() => reloadStoredBackups());

    async function storedBackupLoad(): Promise<void> {
      const name = selectedStoredBackup.value;
      if (name == null) {
        return;
      }
      if (!(await confirmImport())) {
        return;
      }
      try {
        busy.value = true;
        messages.value = await sparkStore.storedBackupLoad(
          props.serviceId,
          name,
        );
      } finally {
        busy.value = false;
      }
    }

    async function storedBackupRead(): Promise<void> {
      const name = selectedStoredBackup.value;
      if (name == null) {
        return;
      }
      try {
        busy.value = true;
        const exported = await sparkStore.storedBackupRead(
          props.serviceId,
          name,
        );
        saveFile(exported, `${name}.json`);
      } finally {
        busy.value = false;
      }
    }

    async function storedBackupSave(): Promise<void> {
      const name: string | undefined = await createDialogPromise({
        component: 'InputDialog',
        componentProps: {
          title: 'Create new backup',
          message:
            'The backup will be stored in the service, and can be loaded later.',
          rules: [
            (v) => !!v || 'Name must not be empty',
            (v) =>
              (v && /^[^<>\:\"\'\/\\\|\?\*]+$/.test(v)) ||
              'Name may not include characters: < > : " \' / \\ | ? *',
          ],
          modelValue: 'New backup',
        },
      });

      if (!name) {
        return;
      }

      if (storedBackupNames.value.includes(name)) {
        const overwriteOk: boolean | undefined = await createDialogPromise({
          component: 'ConfirmDialog',
          componentProps: {
            title: 'Overwrite backup',
            message: `'${name}' already exists. Do you want to overwrite it?`,
          },
        });
        if (!overwriteOk) {
          return;
        }
      }

      try {
        busy.value = true;
        await sparkStore.storedBackupSave(props.serviceId, name);
      } finally {
        busy.value = false;
        await reloadStoredBackups();
      }
    }

    async function backupImport(): Promise<void> {
      loadFile(async (values: any) => {
        if (!(await confirmImport())) {
          return;
        }
        try {
          busy.value = true;
          messages.value = await sparkStore.serviceImport(
            props.serviceId,
            values,
          );
        } finally {
          busy.value = false;
        }
      });
    }

    async function backupExport(): Promise<void> {
      try {
        busy.value = true;
        const exported = await sparkStore.serviceExport(props.serviceId);
        saveFile(exported, `brewblox-blocks-${props.serviceId}.json`);
      } finally {
        busy.value = false;
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      dense,
      busy,
      messages,
      selectedStoredBackup,
      storedBackupNames,
      reloadStoredBackups,
      storedBackupLoad,
      storedBackupRead,
      storedBackupSave,
      backupImport,
      backupExport,
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
    <Card>
      <template #toolbar>
        <Toolbar
          :title="serviceId"
          subtitle="Block backups"
        />
      </template>

      <q-card-section class="q-gutter-sm">
        <div class="text-h5">Stored in the service</div>
        <div class="text-weight-light">
          A new backup is created daily. The latest backup is refreshed every
          hour.
        </div>
        <q-select
          v-model="selectedStoredBackup"
          :options="storedBackupNames"
          label="Available backups"
          clearable
        >
          <template #after>
            <q-btn
              flat
              round
              icon="mdi-reload"
              @click="reloadStoredBackups"
            />
          </template>
        </q-select>
        <div class="col-break" />
        <q-btn
          :loading="busy"
          :disable="!selectedStoredBackup"
          flat
          color="secondary"
          label="Import blocks from backup"
          @click="storedBackupLoad"
        />
        <q-btn
          :loading="busy"
          flat
          color="secondary"
          label="Save blocks to backup"
          @click="storedBackupSave"
        />
        <div class="col-break" />
        <q-btn
          :loading="busy"
          :disable="!selectedStoredBackup"
          flat
          color="secondary"
          label="Export backup to file"
          @click="storedBackupRead"
        />
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <div class="text-h5">Exported to file</div>
        <q-btn
          :loading="busy"
          flat
          color="secondary"
          label="Import blocks from file"
          @click="backupImport"
        />
        <q-btn
          :loading="busy"
          flat
          color="secondary"
          label="Export blocks to file"
          @click="backupExport"
        />
      </q-card-section>

      <q-card-section v-if="messages.length > 0">
        <div class="text-h5">Problems during last import</div>
        <ul>
          <li
            v-for="(msg, idx) in messages"
            :key="idx"
          >
            {{ msg }}
          </li>
        </ul>
      </q-card-section>
    </Card>
  </q-dialog>
</template>
