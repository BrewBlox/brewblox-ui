<script lang="ts">
import fromPairs from 'lodash/fromPairs';
import toPairs from 'lodash/toPairs';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class HeadersDialog extends DialogBase {
  local: string = '';

  @Prop({ type: Object, required: true })
  public readonly value!: Mapped<string>;

  @Prop({ type: String, default: 'Headers' })
  public readonly label!: string;

  save(): void {
    const pairs = this.local
      .split('\n')
      .map(s => s.split(':', 2).map(sub => sub?.trim() ?? ''));
    this.onDialogOk(fromPairs(pairs));
  }

  created(): void {
    this.local = toPairs(this.value)
      .map(items => items.join(': '))
      .join('\n');
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model="local"
        type="textarea"
        :label="label"
        autofocus
        :autogrow="false"
        @keyup.enter.exact.stop
        @keyup.enter.shift.stop
      />
      <div class="q-px-sm">
        <small class="fade-5">
          Request headers are key/value pairs, separated using a ':' character.
          Keys must be unique.
          <br>Each header is placed on a new line.
          <br>Example:
          <br>
          <br><span class="q-ml-lg">Content-Type: application/json</span>
          <br><span class="q-ml-lg">User-Agent: Me, Myself, and I</span>
        </small>
      </div>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
