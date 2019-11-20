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
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="onDialogOk"
  >
    <q-card class="q-dialog-plugin q-dialog-plugin--dark">
      <q-card-section class="q-dialog__title">
        About sessions
      </q-card-section>
      <q-card-section class="scroll">
        Insert help text here
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="onDialogOk"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
