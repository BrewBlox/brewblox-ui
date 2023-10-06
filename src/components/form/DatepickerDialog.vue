<script setup lang="ts">
import { useDialog } from '@/composables';
import { date as qdate } from 'quasar';
import { computed, ref } from 'vue';

const props = defineProps({
  ...useDialog.props,
  modelValue: {
    type: Date,
    required: true,
  },
  label: {
    type: String,
    default: 'Date and time',
  },
});

defineEmits({ ...useDialog.emitsObject });

const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup();
const tab = ref<'date' | 'time'>('date');
const stringValue = ref<string>(
  qdate.formatDate(props.modelValue, 'YYYY/MM/DD HH:mm:ss'),
);

const parsed = computed<Date>(() =>
  qdate.extractDate(stringValue.value, 'YYYY/MM/DD HH:mm:ss'),
);

const valid = computed<boolean>(() => Number.isFinite(parsed.value.getTime()));

function save(): void {
  if (valid.value) {
    onDialogOK(parsed.value);
  }
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <template #body>
        <q-tabs
          v-model="tab"
          dense
          active-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab
            name="date"
            label="Date"
          />
          <q-tab
            name="time"
            label="Time"
          />
        </q-tabs>
        <q-tab-panels
          v-model="tab"
          animated
        >
          <q-tab-panel
            name="date"
            class="q-pa-none"
          >
            <q-date
              v-model="stringValue"
              mask="YYYY/MM/DD HH:mm:ss"
              class="fit"
              @update:model-value="tab = 'time'"
            />
          </q-tab-panel>
          <q-tab-panel
            name="time"
            class="q-pa-none"
          >
            <q-time
              v-model="stringValue"
              mask="YYYY/MM/DD HH:mm:ss"
              class="fit"
            />
          </q-tab-panel>
        </q-tab-panels>
      </template>
      <template #actions>
        <q-btn
          flat
          color="primary"
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!valid"
          flat
          color="primary"
          label="OK"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
