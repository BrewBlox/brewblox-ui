<script lang="ts">
import { Component, Prop, Ref } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { previewSandbox, previewSandboxApi, SandboxResult } from '@/plugins/automation/store/preview-api';


@Component
export default class UserScriptDialog extends DialogBase {
  busy = false;
  local: string = '';
  saved: string = '';

  previewDate: Date | null = null;
  previewResult: SandboxResult = {
    result: null,
    logs: [],
  };
  inspectResult: any = null;
  inspectDate: Date | null = null;

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
      .catch(e => { this.previewResult = { result: null, logs: [], error: e.message }; })
      .finally(() => {
        this.busy = false;
        this.previewDate = new Date();
      });
  }

  inspect(): void {
    this.busy = true;
    previewSandboxApi()
      .then(result => { this.inspectResult = result; })
      .catch(e => { this.inspectResult = e.message; })
      .finally(() => {
        this.busy = false;
        this.inspectDate = new Date();
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
    @keydown.ctrl.73.prevent.stop="inspect"
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
            label="Inspect"
            class="self-stretch"
            :loading="busy"
            @click="inspect"
          >
            <q-tooltip>Ctrl+I</q-tooltip>
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
            <div class="q-pa-md q-gutter-y-md">
              <div v-if="previewResult.error" class="col">
                <div class="text-h6">
                  Error
                </div>
                <div class="text-negative">
                  {{ previewResult.error }}
                </div>
              </div>
              <div class="col">
                <div class="text-h6">
                  Preview
                </div>
                <div>
                  {{ previewDate | dateString('') }}
                </div>
                <div class="text-italic fade-7">
                  This is the output from your code. <br>
                  For a condition to pass, it must return true. <br>
                  You can use 'return a === b' to return true or false.
                </div>
                <vue-json-pretty
                  :data="previewResult.result"
                  :deep="1"
                  class="q-ml-sm q-mt-sm"
                />
              </div>
              <div class="col">
                <div class="text-h6">
                  Messages
                </div>
                <div class="text-italic fade-7">
                  Use console.log() or print() to add a message. <br>
                  You can use this to preview values.
                </div>
                <vue-json-pretty
                  v-if="previewResult.logs.length"
                  :data="previewResult.logs"
                  :deep="1"
                  class="q-ml-sm q-mt-sm"
                />
              </div>
              <q-separator v-if="inspectResult" class="col-auto" />
              <div v-if="inspectResult" class="col">
                <div class="text-h6">
                  Inspect
                </div>
                <div>
                  {{ inspectDate | dateString('') }}
                </div>
                <div class="text-italic fade-7">
                  This shows data and functions you can use in conditions. <br>
                  Blocks from disconnected services are not shown.
                </div>
                <vue-json-pretty
                  :data="inspectResult"
                  :deep="1"
                  class="q-ml-sm q-mt-sm"
                />
              </div>
            </div>
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
