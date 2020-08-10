<script lang="ts">
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import SandboxSnippets from '@/plugins/automation/sandbox/SandboxSnippets.vue';

import JSCheckPreview from './JSCheckPreview.vue';

@Component({
  components: {
    JSCheckPreview,
    SandboxSnippets,
    MonacoEditor: () => import('src/components/editor/MonacoEditor'),
  },
})
export default class JSCheckDialog extends DialogBase {
  sidebar: 'Snippets' | 'Preview' = 'Snippets'
  splitterModel = 400;
  local: string = '';
  saved: string = '';

  @Ref('editor')
  readonly editor!: any;

  @Ref('previewer')
  readonly previewer!: JSCheckPreview;

  @Prop({ type: String, default: 'Editor' })
  public readonly title!: string;

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Prop({ type: Function, required: true })
  public readonly saveFunc!: (value: string) => unknown;

  @Watch('splitterModel')
  public onSplitterChange() {
    this.editor?.layout();
  }

  created(): void {
    this.local = this.value;
    this.saved = this.value;
  }

  get dirty(): boolean {
    return this.local !== this.saved;
  }

  insert(code: string): void {
    this.editor?.insert(code);
  }

  append(code: string): void {
    this.editor?.append(code);
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

  run(): void {
    this.sidebar = 'Preview';
    this.previewer?.run();
  }

  close(): void {
    if (this.saved === this.local) {
      this.onDialogOk();
      return;
    }
    createDialog({
      component: 'SaveConfirmDialog',
      saveFunc: () => this.save(),
    })
      .onOk(() => this.onDialogOk());
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
    @keydown.ctrl.enter.prevent.stop="run"
    @keydown.esc.prevent.stop="close"
  >
    <CardWrapper no-scroll v-bind="{context}">
      <template #toolbar>
        <Toolbar :title="title">
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
            label="Run"
            class="self-stretch"
            @click="run"
          >
            <q-tooltip>Ctrl+Enter</q-tooltip>
          </q-btn>
          <div class="q-mx-md" />
          <q-btn
            flat
            round
            dense
            icon="mdi-close-circle"
            class="close-button"
            @click="close"
          />
        </Toolbar>
      </template>
      <q-splitter
        v-model="splitterModel"
        reverse
        unit="px"
        :limits="[200, Infinity]"
        class="fit"
        after-class="column"
        @change="relayout"
      >
        <template #before>
          <div class="fit row no-scroll">
            <MonacoEditor
              ref="editor"
              v-model="local"
              class="col"
              @run="run"
            />
          </div>
        </template>
        <template #after>
          <div class="fit column no-scroll">
            <q-tabs v-model="sidebar">
              <q-tab name="Snippets" label="Snippets" />
              <q-tab name="Preview" label="Preview" />
            </q-tabs>
            <q-scroll-area class="col">
              <SandboxSnippets
                v-show="sidebar === 'Snippets'"
                @insert="insert"
                @append="append"
              />
              <JSCheckPreview
                v-show="sidebar === 'Preview'"
                ref="previewer"
                :code="local"
              />
            </q-scroll-area>
          </div>
        </template>
      </q-splitter>
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
