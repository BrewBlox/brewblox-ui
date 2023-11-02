<script setup lang="ts">
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { computed } from 'vue';

interface Props {
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
});

const rendered = computed<string>(() =>
  DOMPurify.sanitize(marked.parse(props.text)),
);
</script>

<template>
  <div v-html="rendered" />
</template>
