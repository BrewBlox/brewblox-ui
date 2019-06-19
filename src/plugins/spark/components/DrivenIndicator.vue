<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store';

@Component
export default class DrivenIndicator extends Vue {

  @Prop({ type: String, required: true })
  readonly blockId!: string;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get textChains() {
    return sparkStore.drivenChains(this.serviceId)
      .filter(chain => chain[0] === this.blockId)
      .map(chain => chain
        .slice(1)
        .map((id, idx) => {
          return idx === 0
            ? `set by <i>${id}</i>`
            : `&emsp; which is set by <i>${id}</i>`;
        }));
  }

  get isDriven() {
    return this.textChains.length > 0;
  }
}
</script>

<template>
  <q-list v-if="isDriven" dark separator no-border class="q-pa-none">
    <q-item
      v-for="(chain, chainIdx) in textChains"
      :key="chainIdx"
      class="q-pa-none"
      style="min-height: 0px;"
    >
      <q-item-section>
        <div v-for="text in chain" :key="text">
          <small style="opacity: 0.5" v-html="text"/>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>
