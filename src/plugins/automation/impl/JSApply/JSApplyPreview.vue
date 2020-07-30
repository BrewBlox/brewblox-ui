<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { previewSandbox } from '@/plugins/automation/store/preview-api';
import { SandboxResult } from '@/plugins/automation/types';


@Component
export default class JSApplyPreview extends Vue {
  busy = false;
  result: SandboxResult | null = null;

  @Prop({ type: String, required: true })
  public readonly code!: string;

  run(): void {
    this.busy = true;
    previewSandbox({ body: this.code })
      .then(resp => { this.result = resp; })
      .finally(() => {
        this.busy = false;
      });
  }
}
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <div class="row">
      <q-btn
        outline
        color="primary"
        label="Try it!"
        :loading="busy"
        class="col"
        @click="run"
      >
        <q-tooltip>Ctrl+Enter</q-tooltip>
      </q-btn>
    </div>

    <template v-if="result === null">
      <div class="text-italic fade-7">
        Use the Run button to try your script. <br>
        You can console.log() or print() to inspect available data.
      </div>
    </template>

    <template v-else>
      <div>
        {{ result.date | dateString('') }}
      </div>
      <div v-if="result.error" class="col">
        <div class="text-h6">
          Error
        </div>
        <div class="text-negative">
          <span v-if="result.error.line">line {{ result.error.line }}: </span>
          {{ result.error.message }}
        </div>
      </div>

      <div class="col">
        <div class="text-h6">
          Result
        </div>
        <div class="text-italic fade-7">
          This is the return value from your code. <br>
          If you have an async function, you must return its result.
        </div>
        <vue-json-pretty
          :data="result.returnValue"
          :deep="1"
          class="q-ml-sm q-mt-sm"
        />
      </div>

      <div class="col">
        <div class="text-h6">
          Messages
        </div>
        <div class="text-italic fade-7">
          Use console.log() or print() to add a message. <br>
          Calls to API functions are also shown here.
        </div>
        <vue-json-pretty
          v-if="result.messages.length"
          :data="result.messages"
          :deep="2"
          class="q-ml-sm q-mt-sm"
        />
      </div>
    </template>
  </div>
</template>
