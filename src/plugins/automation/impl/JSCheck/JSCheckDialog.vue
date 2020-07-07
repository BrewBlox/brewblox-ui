<script lang="ts">
import { Component, Prop, Ref } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { previewSandbox } from '@/plugins/automation/store/preview-api';
import { SandboxResult } from '@/plugins/automation/types';

import JSCheckPreview from './JSCheckPreview.vue';

@Component({
  components: {
    JSCheckPreview,
  },
})
export default class JSCheckDialog extends DialogBase {
  busy = false;
  local: string = '';
  saved: string = '';

  previewResult: SandboxResult | null = null;

  @Ref('editor')
  readonly editorElement!: HTMLDivElement;

  @Prop({ type: String, default: 'Editor' })
  public readonly title!: string;

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Prop({ type: Function, required: true })
  public readonly saveFunc!: (value: string) => unknown;

  created(): void {
    this.local = this.value;
    this.saved = this.value;
  }

  get dirty(): boolean {
    return this.local !== this.saved;
  }

  reset(): void {
    this.local = this.saved;
  }

  save(): void {
    if (this.saved !== this.local) {
      this.saved = this.local;
      this.saveFunc(this.local);
    }
  }

  close(): void {
    this.hide();
  }

  preview(): void {
    this.busy = true;
    previewSandbox({ body: this.local })
      .then(resp => { this.previewResult = resp; })
      .finally(() => {
        this.busy = false;
      });
  }
}
</script>


<template>
  <q-dialog
    ref="dialog"
    maximized
    no-backdrop-dismiss
    no-esc-dismiss
    @hide="onDialogHide"
    @keydown.ctrl.83.prevent.stop="save"
    @keydown.ctrl.82.prevent.stop="reset"
    @keydown.ctrl.enter.prevent.stop="preview"
    @keydown.esc.stop="close"
  >
    <CardWrapper no-scroll v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="title">
          <q-btn
            flat
            label="Reset"
            class="self-stretch"
            :color="dirty ? 'primary' : ''"
            @click="reset"
          >
            <q-tooltip>Ctrl+R</q-tooltip>
          </q-btn>
          <q-btn
            flat
            label="Save"
            class="self-stretch"
            :color="dirty ? 'primary' : ''"
            @click="save"
          >
            <q-tooltip>Ctrl+S</q-tooltip>
          </q-btn>
          <q-btn
            flat
            label="Preview"
            class="self-stretch"
            :loading="busy"
            @click="preview"
          >
            <q-tooltip>Ctrl+Enter</q-tooltip>
          </q-btn>
        </DialogToolbar>
      </template>
      <div class="fit row no-wrap">
        <CodeEditor v-model="local" class="col" />
        <div class="col-auto column sidebar">
          <q-scroll-area class="col">
            <JSCheckPreview :result="previewResult" />
          </q-scroll-area>
        </div>
      </div>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </CardWrapper>
  </q-dialog>
</template>

<style lang="sass" scoped>
.sidebar
  height: 100%
  width: 400px
  border-left: 1px solid silver
</style>
