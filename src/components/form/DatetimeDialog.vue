<script lang="ts">
import { date as qdate } from 'quasar';
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { ruleValidator } from '@/utils/functional';

const dateExp = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

export default defineComponent({
  name: 'DatetimeDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Date,
      required: true,
    },
    label: {
      type: String,
      default: 'Date and time',
    },
    resetIcon: {
      type: String,
      default: 'restore',
    },
    rules: {
      type: Array as PropType<InputRule[]>,
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
    const dateString = ref<string>('');
    const timeString = ref<string>('');

    function setStringVal(dateVal: Date): void {
      dateString.value = qdate.formatDate(dateVal, 'YYYY/MM/DD');
      timeString.value = qdate.formatDate(dateVal, 'HH:mm:ss');
    }

    onBeforeMount(() => setStringVal(props.modelValue));

    const parsed = computed<Date | null>(
      () => {
        const combined = `${dateString.value} ${timeString.value}`;
        return dateExp.test(combined) && qdate.isValid(combined)
          ? qdate.extractDate(combined, 'YYYY/MM/DD HH:mm:ss')
          : null;
      },
    );

    const parsedRules = computed<InputRule[]>(
      () => [
        () => parsed.value !== null || 'Invalid date',
        ...props.rules.map(rule => () => rule(parsed.value)),
      ],
    );

    const valid = computed<boolean>(
      () => ruleValidator(parsedRules.value)(parsed.value),
    );

    function save(): void {
      if (valid.value && parsed.value !== null) {
        onDialogOK(parsed.value);
      }
    }

    function openPicker(): void {
      if (!valid.value) { return; }
      createDialog({
        component: 'DatepickerDialog',
        componentProps: {
          modelValue: parsed.value,
          title: props.title,
          message: props.message,
          html: props.html,
          label: props.label,
        },
      })
        .onOk(setStringVal);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      dateString,
      timeString,
      setStringVal,
      parsed,
      parsedRules,
      valid,
      openPicker,
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
    <DialogCard v-bind="{title, message, html}">
      <q-item>
        <q-item-section>
          <q-input
            v-model="dateString"
            :rules="parsedRules"
            label="Date"
            hint="YYYY/MM/DD"
            mask="####/##/##"
            autofocus
          />
        </q-item-section>
        <q-item-section>
          <q-input
            v-model="timeString"
            :rules="parsedRules"
            label="Time"
            hint="HH:mm:ss"
            mask="##:##:##"
          />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            :disable="!valid"
            icon="mdi-calendar-edit"
            flat
            dense
            @click="openPicker"
          >
            <q-tooltip>Pick a date and time</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            :icon="resetIcon"
            flat
            dense
            class="text-white"
            @click="setStringVal(new Date())"
          >
            <q-tooltip>Reset to current date and time</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
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
