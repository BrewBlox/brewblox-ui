<script setup lang="ts">
import { computed } from 'vue';
import { useWidget } from '@/composables';
import { MetricsConfig } from '../types';
import { MetricsWidget } from './types';

const { widget, saveConfig } = useWidget.setup<MetricsWidget>();

const config = computed<MetricsConfig>({
  get: () => widget.value.config,
  set: (cfg) => saveConfig(cfg),
});
</script>

<template>
  <MetricsEditor v-model:config="config" />
</template>
