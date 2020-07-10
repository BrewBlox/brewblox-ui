<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { JSSnippetFactory, snippetMakers } from './snippets';

@Component
export default class JSCheckSnippets extends Vue {
  snippetMakers = snippetMakers;

  apply(maker: JSSnippetFactory): void {
    maker.func(v => this.$emit('insert', v));
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
