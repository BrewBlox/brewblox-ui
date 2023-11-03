<script setup lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { SparkBackup } from '@/plugins/spark/types';
import { createDialogPromise } from '@/utils/dialog';
import { loadFile, saveFile } from '@/utils/import-export';
import formatDate from 'date-fns/format';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'SparkBackupDialog',
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogOpts, onDialogHide, onDialogCancel } =
      useDialog.setup();
    const { dense } = useGlobals.setup();
    const sparkStore = useSparkStore();
    const busy = ref<boolean>(false);

    const selectedStoredBackup = ref<string>();
    const storedBackupNames = ref<string[]>([]);
    const messages = ref<string[]>([]);

    function cleanDate(): string {
      return formatDate(new Date(), 'yyyy-MM-dd_HH-mm');
    }

    async function reloadStoredBackups(): Promise<void> {
      storedBackupNames.value = await sparkStore
        .allStoredBackup(props.serviceId)
        .then((arr) => arr.sort().reverse());
    }

    async function confirmImport(): Promise<boolean> {
      const retv = await createDialogPromise({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Reset blocks?',
          message:
            'This will remove all blocks, and load new ones from the backup. Are you sure?',
        },
        noBackdropDismiss: true,
      });
      return retv ?? false;
    }

    async function selectNewName(
      defaultName: string,
    ): Promise<string | undefined> {
      let name = defaultName;
      while (true) {
        name = await createDialogPromise({
          component: 'InputDialog',
          componentProps: {
            title: 'Create backup',
            message:
              'The backup will be stored in the service, and can be loaded later.',
            rules: [
              (v) => !!v || 'Name must not be empty',
              (v) =>
                (v && /^[^<>\:\"\'\/\\\|\?\*]+$/.test(v)) ||
                'Name may not include characters: < > : " \' / \\ | ? *',
            ],
            modelValue: name,
          },
        });
        // cancelled
        if (name == null) {
          return undefined;
        }

        if (storedBackupNames.value.includes(name)) {
          const overwriteOk: boolean | undefined = await createDialogPromise({
            component: 'ConfirmDialog',
            componentProps: {
              title: 'Overwrite backup?',
              message: `'${name}' already exists. Do you want to overwrite it?`,
              ok: 'Yes',
              nok: 'No',
            },
          });
          // cancelled
          if (overwriteOk == null) {
            return undefined;
          }
          // no overwrite - return to name select
          if (overwriteOk === false) {
            continue;
          }
        }

        return name;
      }
    }

    onMounted(() => reloadStoredBackups());

    async function loadStoredBackup(): Promise<void> {
      const name = selectedStoredBackup.value;
      if (name == null) {
        return;
      }
      if (!(await confirmImport())) {
        return;
      }
      try {
        busy.value = true;
        messages.value = await sparkStore.loadStoredBackup(
          props.serviceId,
          name,
        );
      } finally {
        busy.value = false;
      }
    }

    async function saveStoredBackup(): Promise<void> {
      const name = await selectNewName(
        `blocks_${props.serviceId}_${cleanDate()}`,
      );
      if (name == null) {
        return;
      }

      try {
        busy.value = true;
        await sparkStore.saveStoredBackup(props.serviceId, name);
      } finally {
        busy.value = false;
        await reloadStoredBackups();
      }
    }

    async function uploadStoredBackup(): Promise<void> {
      loadFile(async (values: any) => {
        const name = await selectNewName(
          `blocks_${props.serviceId}_${cleanDate()}`,
        );
        if (name == null) {
          return;
        }

        try {
          busy.value = true;
          const data: SparkBackup = {
            ...values,
            name,
          };
          messages.value = await sparkStore.serviceImport(
            props.serviceId,
            data,
          );
        } finally {
          busy.value = false;
        }
      });
    }

    async function downloadStoredBackup(): Promise<void> {
      const name = selectedStoredBackup.value;
      if (name == null) {
        return;
      }
      try {
        busy.value = true;
        const data = await sparkStore.downloadStoredBackup(
          props.serviceId,
          name,
        );
        saveFile(data, `${name}.json`);
      } finally {
        busy.value = false;
      }
    }

    return {
      dialogRef,
      dialogOpts,
      onDialogHide,
      onDialogCancel,
      dense,
      busy,
      messages,
      selectedStoredBackup,
      storedBackupNames,
      reloadStoredBackups,
      loadStoredBackup,
      saveStoredBackup,
      downloadStoredBackup,
      uploadStoredBackup,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogOpts"
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
        <q-select
          v-model="selectedStoredBackup"
          :options="storedBackupNames"
          label="Available backups"
          clearable
          class="col-grow"
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
          flat
          color="secondary"
          label="Save blocks to backup"
          @click="saveStoredBackup"
        />
        <q-btn
          :loading="busy"
          :disable="!selectedStoredBackup"
          flat
          color="secondary"
          label="Load blocks from backup"
          @click="loadStoredBackup"
        />
        <div class="col-break" />
        <q-btn
          :loading="busy"
          flat
          color="secondary"
          label="Upload backup"
          @click="uploadStoredBackup"
        />
        <q-btn
          :loading="busy"
          :disable="!selectedStoredBackup"
          flat
          color="secondary"
          label="Download backup"
          @click="downloadStoredBackup"
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
