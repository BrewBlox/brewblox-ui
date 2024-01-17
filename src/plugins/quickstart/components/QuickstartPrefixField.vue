<script setup lang="ts">
import { computed, ref } from 'vue';
import { makeRuleValidator } from '@/utils/rules';

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [payload: string];
  clear: [];
}>();

const rules = [
  (v: any) => /^($|[a-zA-Z])/.test(v) || 'Name must start with a letter',
  (v: any) =>
    /^[a-zA-Z0-9 \(\)_\-\|]*$/.test(v) ||
    'Name may only contain letters, numbers, spaces, and ()-_|',
];
const validator = makeRuleValidator(rules);

const local = ref<string | null>(null);

const prefix = computed<string>({
  get: () => local.value ?? props.modelValue,
  set: (val) => {
    if (validator(val)) {
      local.value = null;
      emit('update:modelValue', val);
    } else {
      local.value = val;
      // Don't emit invalid prefix
      // The parent element only wants valid updates
    }
  },
});
</script>

<template>
  <QuickstartNameField
    v-model="prefix"
    :rules="rules"
    optional
    label="Prefix for names"
    @clear="$emit('clear')"
  >
    <template #help>
      By default all block names are prefixed. You can override this for
      individual blocks.
    </template>
  </QuickstartNameField>
</template>
