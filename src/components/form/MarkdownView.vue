<script lang="ts">
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'MarkdownView',
  props: {
    text: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const rendered = computed<string>(() =>
      DOMPurify.sanitize(marked.parse(props.text)),
    );
    return {
      rendered,
    };
  },
});
</script>

<template>
  <div v-html="rendered" />
</template>
