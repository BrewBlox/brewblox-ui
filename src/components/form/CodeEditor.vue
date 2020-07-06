<script lang="ts">
import 'brace';
import 'brace/mode/javascript';
import 'brace/theme/tomorrow_night_eighties';

import * as ace from 'brace';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class CodeEditor extends Vue {
  editor: ace.Editor | null = null;
  local: string = '';

  @Prop({ type: String, default: 'Editor' })
  public readonly title!: string;

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Watch('value')
  watchExternalChanges(newV: string): void {
    if (this.editor && newV !== this.local) {
      this.local = newV;
      this.editor.setValue(newV, 1);
    }
  }

  mounted(): void {
    this.editor = ace.edit(this.$el as HTMLElement);
    this.editor.$blockScrolling = Infinity;
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/tomorrow_night_eighties');

    this.local = this.value;
    this.editor.setValue(this.local, 1);

    this.editor.on('change', () => {
      if (this.editor) {
        this.local = this.editor.getValue();
        this.$emit('input', this.local);
      }
    });
    this.editor.focus();
  }

  beforeDestroy(): void {
    this.editor?.destroy();
    this.editor?.container.remove();
  }
}
</script>

<template>
  <div class="editor-container" />
</template>

<style lang="sass" scoped>
.editor-container
  position: relative
</style>
