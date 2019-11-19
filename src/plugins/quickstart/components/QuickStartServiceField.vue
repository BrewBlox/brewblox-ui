<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Service } from '@/store/services';


@Component
export default class QuickStartServiceField extends Vue {

  @Prop({ type: String, required: false })
  public readonly value!: string;

  @Prop({ type: Array, required: true })
  public readonly services!: Service[];

  get local(): string {
    return this.value;
  }

  set local(value: string) {
    this.$emit('input', value);
  }

  get opts(): SelectOption[] {
    return this.services
      .map(svc => ({ label: svc.title, value: svc.id }));
  }
}
</script>

<template>
  <q-item>
    <q-select
      v-model="local"
      :options="opts"
      map-options
      emit-value
      label="Service"
    />
  </q-item>
</template>
