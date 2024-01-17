<script setup lang="ts">
interface Props {
  title?: string | null;
  message?: string;
  html?: boolean;
  separated?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: null,
  message: '',
  html: false,
  separated: false,
});
</script>

<template>
  <q-card class="q-dialog-plugin q-dialog-plugin--dark overflow-auto">
    <q-card-section
      v-if="title"
      class="q-dialog__title"
    >
      {{ title }}
    </q-card-section>
    <template v-if="$slots.message">
      <q-card-section class="q-dialog__message scroll">
        {{ message }}
        <slot name="message" />
      </q-card-section>
    </template>
    <template v-else-if="!message" />
    <q-card-section
      v-else-if="html"
      class="q-dialog__message scroll"
      v-html="message"
    />
    <q-card-section
      v-else
      class="q-dialog__message scroll"
    >
      {{ message }}
    </q-card-section>
    <slot name="body">
      <q-card-section class="scroll q-gutter-xs">
        <slot />
      </q-card-section>
    </slot>
    <q-separator v-if="separated" />
    <q-card-actions
      v-if="$slots.actions"
      align="right"
    >
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>
