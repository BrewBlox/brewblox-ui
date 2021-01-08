<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { systemStore } from '@/store/system';


@Component
export default class PageError extends Vue {

  get loaded(): boolean {
    return systemStore.loaded;
  }
}
</script>

<template>
  <div
    class="text-h5 darkened absolute-center column items-center q-gutter-md"
  >
    <template v-if="loaded">
      <slot />
    </template>
    <template v-else>
      <q-spinner size="30px" />
      <div>
        Waiting for datastore...
      </div>
    </template>
  </div>
</template>
