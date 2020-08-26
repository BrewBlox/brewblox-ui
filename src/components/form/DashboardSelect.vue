<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { dashboardStore } from '@/store/dashboards';


@Component
export default class DashboardSelect extends Vue {

  @Prop({ type: String, required: false })
  public readonly value!: string | null;

  @Prop({ type: String, required: false })
  public readonly defaultValue!: string;

  @Prop({ type: String, default: 'Dashboard' })
  public readonly label!: string;

  mounted(): void {
    if (!this.value && this.defaultValue) {
      this.save(this.defaultValue);
    }
  }

  get options(): SelectOption[] {
    return dashboardStore.dashboards
      .map(dash => ({ label: dash.title, value: dash.id }));
  }

  save(value: string | null): void {
    this.$emit('input', value);
  }
}
</script>

<template>
  <q-select
    v-bind="{ label, value, options, ...$attrs }"
    map-options
    emit-value
    @input="save"
    @keyup.enter.exact.stop
  />
</template>
