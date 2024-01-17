<script setup lang="ts">
import { useContext } from '@/composables';
import TempControlBasic from './TempControlBasic.vue';
import TempControlFull from './TempControlFull.vue';

const modes = {
  Basic: TempControlBasic,
  Full: TempControlFull,
} as const;

const { context } = useContext.setup();
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <component :is="modes[context.mode]" />
  </Card>
</template>
