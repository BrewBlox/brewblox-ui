<script lang="ts">
import { useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber } from '@/utils/quantity';
import { makeRuleValidator } from '@/utils/rules';
import { computed, defineComponent, PropType, ref } from 'vue';

const typeValidator = (v: unknown): boolean =>
  typeof v === 'string' && ['text', 'number'].includes(v);

export default defineComponent({
  name: 'InputDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: null as unknown as PropType<string | number | null>,
      default: null,
    },
    type: {
      type: String as PropType<'text' | 'number'>,
      default: 'text',
      validator: typeValidator,
    },
    decimals: {
      type: Number,
      default: 2,
    },
    label: {
      type: String,
      default: '',
    },
    rules: {
      type: Array as PropType<InputRule[]>,
      default: () => [],
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    autogrow: {
      type: Boolean,
      default: false,
    },
    fontSize: {
      type: String,
      default: '170%',
    },
    suffix: {
      type: String,
      default: '',
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();

    const local = ref<string>(
      props.type === 'number'
        ? fixedNumber(Number(props.modelValue), props.decimals)
        : `${props.modelValue ?? ''}`,
    );

    const isValid = computed<boolean>(() =>
      makeRuleValidator(props.rules)(local.value),
    );

    const nativeProps = computed<AnyDict>(() =>
      props.type === 'number'
        ? {
            inputmode: 'numeric',
            pattern: '[0-9\.]*',
          }
        : {},
    );

    function save(): void {
      if (!isValid.value) {
        return;
      }
      const outputValue =
        props.type === 'number' ? parseFloat(local.value) : local.value;
      onDialogOK(outputValue);
    }

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: local.value,
          type: props.type,
          rules: props.rules,
        },
      }).onOk((v) => (local.value = v));
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      isValid,
      nativeProps,
      save,
      showKeyboard,
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
    <DialogCard v-bind="{ title, message, html }">
      <q-input
        v-model="local"
        v-bind="{ rules, clearable, label, autogrow, suffix, ...nativeProps }"
        :input-style="{ fontSize }"
        autofocus
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
          :disable="!isValid"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
