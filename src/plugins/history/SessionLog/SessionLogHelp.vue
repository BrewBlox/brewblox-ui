<script lang="ts">
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';


@Component
export default class SessionLogHelp extends DialogBase {

}
</script>


<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="onDialogOk"
  >
    <DialogCard title="About sessions">
      <template #message>
        Insert help text here
      </template>
      <template #actions>
        <q-btn flat label="OK" color="primary" @click="onDialogOk" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
