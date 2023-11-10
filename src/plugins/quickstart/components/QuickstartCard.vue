<script setup lang="ts">
import { inject, ref } from 'vue';
import { QuickstartCardTitleKey } from '../symbols';

const title = inject(QuickstartCardTitleKey, ref('Wizard'));
</script>

<template>
  <Card>
    <template #toolbar>
      <Toolbar
        icon="mdi-creation"
        :title="title"
      />
    </template>
    <slot />

    <template #actions>
      <slot name="actions" />
    </template>
  </Card>
</template>
