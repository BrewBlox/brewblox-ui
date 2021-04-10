<script lang="ts">
import * as monaco from 'monaco-editor';
import { debounce } from 'quasar';
import {
  defineComponent,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: 'Editor',
    },
    body: {
      type: String,
      required: true,
    },
  },
  emits: ['update:body', 'run'],
  setup: (props, { emit }) => {
    const root = ref<HTMLElement | null>(null);
    const layout = debounce(() => editor?.layout(), 100);
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;

    function initEditor(): void {
      editor = monaco.editor.create(root.value!, {
        value: props.body,
        theme: 'vs-dark',
        language: 'javascript',
        tabSize: 2,
        insertSpaces: true,
      });

      editor.onDidChangeModelContent(ev => {
        const value = editor?.getValue();
        if (props.body !== value) {
          emit('update:body', value, ev);
        }
      });

      editor.addAction({
        id: 'run-code',
        label: 'Run',
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        ],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 1,
        run: () => { emit('run'); },
      });
    }

    watch(
      () => props.body,
      (newV: string) => {
        if (editor && newV !== editor.getValue()) {
          setEditorValue(newV);
        }
      });

    onBeforeMount(() => {
      window.addEventListener('resize', layout);
    });

    onMounted(() => {
      setTimeout(() => initEditor(), 100);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', layout);
      editor?.dispose();
    });

    function setEditorValue(text: string): void {
      editor?.setValue(text);
      nextTick(() => editor?.focus());
    }

    function insert(text: string): void {
      const range = editor?.getSelection();
      if (!editor || !range) {
        return;
      }
      editor.executeEdits('MonacoEditor', [{
        range,
        text,
        forceMoveMarkers: true,
      }]);
      nextTick(() => editor?.focus());
    }

    function append(text: string): void {
      const sep = !props.body || props.body.endsWith('\n') ? '' : '\n';
      setEditorValue(`${props.body}${sep}${text}\n`);
    }

    return {
      root,
      insert,
      append,
    };
  },
});
</script>

<template>
  <div />
</template>
