<script setup lang="ts">
import { Widget } from '@/store/widgets';
import { computed, onMounted, PropType } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  valid: {
    type: Boolean,
    required: true,
  },
  widget: {
    type: Object as PropType<Widget>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'update:widget', value: Widget);
  (e: 'update:valid', value: boolean): void;
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
