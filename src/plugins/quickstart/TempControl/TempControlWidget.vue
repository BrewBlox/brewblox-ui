<script setup lang="ts">
import TempControlBasic from './TempControlBasic.vue';
import TempControlFull from './TempControlFull.vue';
import { useContext } from '@/composables';

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
