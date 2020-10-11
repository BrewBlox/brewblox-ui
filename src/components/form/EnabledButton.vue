<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class EnabledButton extends Vue {
  @Prop({ type: Boolean, required: true })
  public readonly value!: boolean;

  save(val: boolean): void {
    this.$emit('input', val);
  }


  get icon(): string {
    return this.value
      ? 'mdi-checkbox-marked-outline'
      : 'mdi-checkbox-blank-outline';
  }
}
</script>

<template>
  <q-btn
    flat
    :icon="icon"
    v-bind="$attrs"
    @click="save(!value)"
  >
    <q-tooltip>
      Toggle enabled
    </q-tooltip>
  </q-btn>
</template>
