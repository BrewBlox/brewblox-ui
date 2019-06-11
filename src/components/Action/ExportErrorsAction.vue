<script lang="ts">
import FileSaver from 'file-saver';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { getErrors as getDbErrors } from '@/helpers/database';
import { getErrors as getFetchErrors } from '@/helpers/fetch';

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
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'brewblox-errors.json');
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="showDialog"/>
</template>
