<script lang="ts">
import isArray from 'lodash/isArray';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { JSSnippetFactory, snippetMakers } from './snippets';

@Component
export default class JSCheckSnippets extends Vue {
  snippetMakers = snippetMakers;

  joined(value: string | string[]): string {
    return isArray(value)
      ? value.join('\n')
      : value;
  }

  insert(value: string | string[]): void {
    this.$emit('insert', this.joined(value));
  }

  append(value: string | string[]): void {
    this.$emit('append', this.joined(value));
  }

  apply(maker: JSSnippetFactory): void {
    maker.func(this.insert, this.append);
  }
}
</script>

<template>
  <div class="q-pa-md q-gutter-y-sm">
    <div
      v-for="(mk, idx) in snippetMakers"
      :key="`snippet-${idx}`"
      class="col clickable q-pa-sm rounded-borders text-h6"
      @click="apply(mk)"
    >
      {{ mk.desc }}
    </div>
  </div>
</template>
