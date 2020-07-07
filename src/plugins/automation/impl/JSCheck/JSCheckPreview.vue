<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { SandboxResult } from '@/plugins/automation/types';


@Component
export default class JSCheckPreview extends Vue {

  @Prop({ type: Object, required: false })
  public readonly result!: SandboxResult;
}
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <template v-if="result === null">
      <div class="text-italic fade-7">
        Use the preview function to try your script. <br>
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
          For a condition to pass, it must return true.
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
          You can use this to inspect objects.
        </div>
        <vue-json-pretty
          v-if="result.messages.length"
          :data="result.messages"
          :deep="1"
          class="q-ml-sm q-mt-sm"
        />
      </div>
    </template>
  </div>
</template>
