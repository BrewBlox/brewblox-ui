<script lang="ts">
import * as monaco from 'monaco-editor';
import { debounce } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class MonacoEditor extends Vue {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  public layout: (() => void) = () => { };

  @Prop({ type: String, default: 'Editor' })
  public readonly title!: string;

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Watch('value')
  private watchExternalChanges(newV: string): void {
    if (this.editor && newV !== this.editor.getValue()) {
      this.setEditorValue(newV);
    }
  }

  private initEditor(): void {
    this.editor = monaco.editor.create(this.$el as HTMLElement, {
      value: this.value,
      theme: 'vs-dark',
      language: 'javascript',
      tabSize: 2,
      insertSpaces: true,
    });

    this.editor.onDidChangeModelContent(ev => {
      const value = this.editor?.getValue();
      if (this.value !== value) {
        this.$emit('input', value, ev);
      }
    });

    this.editor.addAction({
      id: 'run-code',
      label: 'Run',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1,
      run: () => { this.$emit('run'); },
    });
  }

  public created(): void {
    this.layout = debounce(() => this.editor?.layout(), 100);
    window.addEventListener('resize', this.layout);
  }

  public mounted(): void {
    // Provides a smoother experience in dialogs
    setTimeout(() => this.initEditor(), 100);
  }

  public beforeDestroy(): void {
    window.removeEventListener('resize', this.layout);
    this.editor?.dispose();
  }

  private setEditorValue(text: string): void {
    this.editor?.setValue(text);
    this.$nextTick(() => this.editor?.focus());
  }

  public insert(text: string): void {
    const range = this.editor?.getSelection();
    if (!this.editor || !range) {
      return;
    }
    this.editor.executeEdits('MonacoEditor', [{
      range,
      text,
      forceMoveMarkers: true,
    }]);
    this.$nextTick(() => this.editor?.focus());
  }

  public append(text: string): void {
    const sep = !this.value || this.value.endsWith('\n') ? '' : '\n';
    this.setEditorValue(`${this.value}${sep}${text}\n`);
  }
}

</script>

<template>
  <div />
</template>
