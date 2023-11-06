<script setup lang="ts">
import {
  UseValEditEmits,
  UseValEditProps,
  useValEdit,
} from '@/plugins/spark/composables';

withDefaults(defineProps<UseValEditProps<boolean>>(), {
  ...useValEdit.defaultProps<boolean>(),
});

defineEmits<UseValEditEmits<boolean>>();

const { field } = useValEdit.setup<boolean>();
</script>

<template>
  <q-toggle v-model="field" />
</template>
