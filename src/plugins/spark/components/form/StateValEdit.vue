<script setup lang="ts">
import { DigitalState } from 'brewblox-proto/ts';
import {
  useValEdit,
  UseValEditEmits,
  UseValEditProps,
} from '@/plugins/spark/composables';

type VT = DigitalState;

withDefaults(defineProps<UseValEditProps<VT>>(), {
  ...useValEdit.defaultProps<VT>(),
});

defineEmits<UseValEditEmits<VT>>();

const { field } = useValEdit.setup<DigitalState>();
</script>

<template>
  <div>
    <DigitalStateButton v-model="field" />
  </div>
</template>
