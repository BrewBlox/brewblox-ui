<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class AutomationFieldHeader extends Vue {
  @Prop({ type: String, required: true })
  public readonly label!: string;

  @Prop({ type: Boolean, required: true })
  public readonly enabled!: boolean;

  save(value: boolean): void {
    this.$emit('update:enabled', value);
  }
}
</script>

<template>
  <div class="row items-center">
    <div class="col-grow text-h6 text-italic">
      {{ label }}
    </div>
    <div class="col-auto">
      <q-toggle :value="enabled" @input="save">
        <q-tooltip>Toggle enabled</q-tooltip>
      </q-toggle>
    </div>
  </div>
</template>
