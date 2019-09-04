<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { getErrors as getFetchErrors } from '@/helpers/fetch';
import { saveJsonFile } from '@/helpers/import-export';
import database from '@/plugins/database';

@Component
export default class ExportErrorsAction extends Vue {

  @Prop({ type: String, default: 'mdi-file-export' })
  public readonly icon!: string;

  @Prop({ type: String, default: 'Export API errors' })
  public readonly label!: string;

  get itemProps(): Record<string, any> {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  async showDialog(): Promise<void> {
    const errors = { fetch: getFetchErrors(), database: database.getErrors() };
    saveJsonFile(JSON.stringify(errors, null, 2), 'brewblox-errors.json', true);
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="showDialog" />
</template>
