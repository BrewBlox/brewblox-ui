<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Widget } from '@/store/widgets';

interface Props {
  widget: Widget;
  valid: boolean;
  featureType: string;
  featureTitle: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:widget': [payload: Widget];
  'update:valid': [payload: boolean];
}>();

const title = computed<string>({
  get: () => props.widget.title,
  set: (v) => emit('update:widget', { ...props.widget, title: v }),
});

onMounted(() => emit('update:valid', true));
</script>

<template>
  <q-input
    v-model.lazy="title"
    label="Widget name"
  />
</template>
