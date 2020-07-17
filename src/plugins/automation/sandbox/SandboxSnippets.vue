<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { generators, SnippetGenerator } from './snippets';

@Component
export default class SandboxSnippets extends Vue {

  @Prop({ type: Function, default: (() => true) })
  public readonly filter!: (v: SnippetGenerator) => boolean;

  get generators(): SnippetGenerator[] {
    return generators.filter(this.filter);
  }

  apply(generator: SnippetGenerator): void {
    generator.run((mode, lines) => this.$emit(mode, lines.join('\n')));
  }
}
</script>

<template>
  <div class="q-pa-md q-gutter-y-sm">
    <div
      v-for="(g, idx) in generators"
      :key="`snippet-gen-${idx}`"
      class="col clickable q-pa-sm rounded-borders text-h6"
      @click="apply(g)"
    >
      {{ g.desc }}
    </div>
  </div>
</template>
