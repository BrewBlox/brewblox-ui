<script setup lang="ts">
import { MetricsConfig } from '../types';
import { MetricsWidget } from './types';
import { useWidget } from '@/composables';
import { computed } from 'vue';

const { widget, saveConfig } = useWidget.setup<MetricsWidget>();

const config = computed<MetricsConfig>({
  get: () => widget.value.config,
  set: (cfg) => saveConfig(cfg),
});
</script>

<template>
  <MetricsEditor v-model:config="config" />
</template>
