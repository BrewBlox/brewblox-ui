<script setup lang="ts">
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
});

const rendered = computed<string>(() =>
  DOMPurify.sanitize(marked.parse(props.text)),
);
</script>

<template>
  <div v-html="rendered" />
</template>
