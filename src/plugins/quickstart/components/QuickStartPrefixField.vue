<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { ruleValidator } from '@/helpers/functional';


@Component
export default class QuickStartPrefixField extends Vue {
  rules = [
    v => /^($|[a-zA-Z])/.test(v) || 'Name must start with a letter',
    v => /^[a-zA-Z0-9 \(\)_\-\|]*$/.test(v) || 'Name may only contain letters, numbers, spaces, and ()-_|',
  ];
  validator = ruleValidator(this.rules);
  local: string | null = null;

  @Prop({ type: String, required: true })
  public readonly value!: string;

  get prefix(): string {
    return this.local ?? this.value;
  }

  set prefix(val: string) {
    if (this.validator(val)) {
      this.local = null;
      this.$emit('input', val);
    }
    else {
      this.local = val;
      // Don't emit invalid prefix
      // The parent element only wants valid updates
    }
  }
}
</script>

<template>
  <QuickStartNameField
    v-model="prefix"
    :rules="rules"
    optional
    label="Prefix for names"
    @clear="$emit('clear')"
  >
    <template #help>
      By default all block names are prefixed.
      You can override this for individual blocks.
    </template>
  </QuickStartNameField>
</template>
