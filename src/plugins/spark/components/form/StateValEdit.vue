<script setup lang="ts">
import {
  UseValEditEmits,
  UseValEditProps,
  useValEdit,
} from '@/plugins/spark/composables';
import { DigitalState } from 'brewblox-proto/ts';

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
