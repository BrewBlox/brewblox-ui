import * as monaco from 'monaco-editor';
import Vue, { CreateElement, VNode } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class CodeEditor extends Vue {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;

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

  public mounted(): void {
    // Provides a smoother experience in dialogs
    setTimeout(() => this.initEditor(), 100);
  }

  public beforeDestroy(): void {
    this.editor?.dispose();
  }

  private setEditorValue(text: string): void {
    this.editor?.setValue(text);
    this.$nextTick(() => this.editor?.focus());
  }

  public insert(text: string): void {
    this.editor?.trigger('keyboard', 'type', { text });
    this.$nextTick(() => this.editor?.focus());
  }

  public append(text: string): void {
    const sep = !this.value || this.value.endsWith('\n') ? '' : '\n';
    this.setEditorValue(`${this.value}${sep}${text}\n`);
  }

  public render(h: CreateElement): VNode {
    return h('div');
  }
}
