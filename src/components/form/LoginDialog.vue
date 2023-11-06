<script setup lang="ts">
import { authLogin } from '@/auth';
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import { ref } from 'vue';

interface Props extends UseDialogProps {
  title?: string;
}

withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  title: 'Login',
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<never>();

const username = ref<string>('');
const password = ref<string>('');

async function login(): Promise<void> {
  try {
    await authLogin({
      username: username.value,
      password: password.value,
    });
    onDialogOK();
  } catch {
    notify.error('Login failed');
  }
}

function showUsernameKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: username.value,
    },
  }).onOk((v) => (username.value = v));
}

function showPasswordKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: password.value,
      password: true,
    },
  }).onOk((v) => (password.value = v));
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="login"
  >
    <DialogCard v-bind="{ title, message, html }">
      <q-input
        v-model="username"
        autofocus
        label="User name"
      >
        <template #append>
          <KeyboardButton @click="showUsernameKeyboard" />
        </template>
      </q-input>
      <q-input
        v-model="password"
        type="password"
        label="Password"
      >
        <template #append>
          <KeyboardButton @click="showPasswordKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          flat
          label="Login"
          color="primary"
          @click="login"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
