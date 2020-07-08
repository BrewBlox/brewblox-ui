<script lang="ts">
import { Component, Prop, Ref } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import JSCheckPreview from './JSCheckPreview.vue';
import JSCheckSnippets from './JSCheckSnippets.vue';

@Component({
  components: {
    JSCheckPreview,
    JSCheckSnippets,
  },
})
export default class JSCheckDialog extends DialogBase {
  sidebar = 'Snippets'
  local: string = '';
  saved: string = '';

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

  insertSnippet(code: string): void {
    this.local += code;
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
}
</script>


<template>
  <q-dialog
    ref="dialog"
    maximized
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keydown.ctrl.83.prevent.stop="save"
    @keydown.ctrl.82.prevent.stop="reset"
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
          <div class="q-mx-md" />
        </DialogToolbar>
      </template>
      <div class="fit row no-wrap">
        <CodeEditor v-model="local" class="col" />
        <div class="col-auto column sidebar">
          <q-tabs v-model="sidebar">
            <q-tab name="Snippets" label="Snippets" />
            <q-tab name="Preview" label="Preview" />
          </q-tabs>
          <q-scroll-area class="col">
            <JSCheckSnippets
              v-show="sidebar === 'Snippets'"
              @insert="insertSnippet"
            />
            <JSCheckPreview
              v-show="sidebar === 'Preview'"
              :code="local"
            />
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
