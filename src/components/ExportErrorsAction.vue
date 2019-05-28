<script lang="ts">
import FileSaver from 'file-saver';
import Vue from 'vue';
import Component from 'vue-class-component';

import { getErrors as getDbErrors } from '@/helpers/database';
import { getErrors as getFetchErrors } from '@/helpers/fetch';

@Component({
  props: {
    icon: {
      type: String,
      default: 'mdi-file-export',
    },
    label: {
      type: String,
      default: 'Export API errors',
    },
    noClose: {
      type: Boolean,
      default: false,
    },
  },
})
export default class ExportErrorsAction extends Vue {
  async showDialog() {
    const errors = { fetch: getFetchErrors(), db: getDbErrors() };
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'brewblox-errors.json');
  }
}
</script>

<template>
  <ActionItem v-bind="$props" @click="showDialog"/>
</template>
