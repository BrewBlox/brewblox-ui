<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { Quantity } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';
import { isQuantity } from '@/utils/identity';
import { bloxQty, durationMs, durationString } from '@/utils/quantity';
import { makeRuleValidator } from '@/utils/rules';


export default defineComponent({
  name: 'DurationQuantityDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<Quantity>,
      validator: isQuantity,
      required: true,
    },
    label: {
      type: String,
      default: 'Value',
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
    const local = ref<string | null>(durationString(props.modelValue));

    function findUnit(s: string): string {
      const match = s.match(/^[0-9\.]*([a-z]*)/i);
      return match && match[1]
        ? match[1]
        : '';
    }

    const defaultUnit = computed<string>(
      () => findUnit(local.value || '') === ''
        ? findUnit(durationString(props.modelValue))
        : '',
    );

    const localMs = computed<number>(
      () => durationMs(`${local.value || 0}${defaultUnit.value}`),
    );

    const valueOk = computed<boolean>(
      () => makeRuleValidator(props.rules)(localMs.value),
    );

    const error = computed<string | null>(
      () => makeRuleValidator(props.rules, 'error')(localMs.value),
    );

    function normalize(): void {
      local.value = durationString(localMs.value);
    }

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: local.value,
          type: 'duration',
          rules: props.rules.map(f => (s: string) => f(durationMs(s))),
        },
      })
        .onOk((v: string) => {
          local.value = v;
          normalize();
        });
    }

    function save(): void {
      if (valueOk.value) {
        onDialogOK(bloxQty(local.value ?? '0s'));
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      defaultUnit,
      localMs,
      valueOk,
      error,
      normalize,
      showKeyboard,
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
      <q-input
        v-model="local"
        :label="label"
        :suffix="defaultUnit"
        :error="!!error"
        :error-message="error"
        autofocus
        item-aligned
        @change="normalize"
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!valueOk"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
