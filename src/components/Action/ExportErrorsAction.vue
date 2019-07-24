<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { getErrors as getDbErrors } from '@/helpers/database';
import { getErrors as getFetchErrors } from '@/helpers/fetch';
import { saveJsonFile } from '@/helpers/import-export';

@Component
export default class ExportErrorsAction extends Vue {

  @Prop({ type: String, default: 'mdi-file-export' })
  public readonly icon!: string;

  @Prop({ type: String, default: 'Export API errors' })
  public readonly label!: string;

  get itemProps() {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  async showDialog() {
    const errors = { fetch: getFetchErrors(), db: getDbErrors() };
    saveJsonFile(JSON.stringify(errors, null, 2), 'brewblox-errors.json', true);
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="showDialog" />
</template>
