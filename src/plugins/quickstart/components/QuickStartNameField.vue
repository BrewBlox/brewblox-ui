<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';


@Component
export default class QuickStartNameField extends Vue {

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Prop({ type: Boolean, default: false })
  public readonly optional!: boolean;

  @Emit('clear')
  clear(): void { }

  get local(): string {
    return this.value;
  }

  set local(value: string) {
    this.$emit('input', value);
  }
}
</script>

<template>
  <q-item dark dense>
    <q-input v-model="local" v-bind="$attrs" :error="!optional && !local" dark dense>
      <template #append>
        <q-btn
          icon="mdi-backup-restore"
          flat
          round
          size="sm"
          color="white"
          @click="clear"
        >
          <q-tooltip>Reset to default</q-tooltip>
        </q-btn>
        <q-icon v-if="!!$scopedSlots.help" name="mdi-information" size="20px">
          <q-tooltip>
            <slot name="help" />
          </q-tooltip>
        </q-icon>
      </template>
    </q-input>
  </q-item>
</template>
