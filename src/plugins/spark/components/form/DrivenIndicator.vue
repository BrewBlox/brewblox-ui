<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createBlockDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

@Component
export default class DrivenIndicator extends Vue {

  @Prop({ type: String, required: true })
  readonly blockId!: string;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get driveChains(): string[][] {
    return sparkStore.drivenChains(this.serviceId)
      .filter(chain => chain[0] === this.blockId);
  }

  get textChains(): string[][] {
    return this.driveChains
      .map(chain => chain
        .slice(1)
        .map((id, idx) => {
          return idx === 0
            ? `Driven by <i>${id}</i>`
            : `&emsp; which is driven by <i>${id}</i>`;
        }));
  }

  get isDriven(): boolean {
    return this.textChains.length > 0;
  }

  bossDriver(chainIdx: number): string {
    const chain = this.driveChains[chainIdx];
    return chain[chain.length - 1];
  }

  showDialog(chainIdx: number): void {
    createBlockDialog(sparkStore.tryBlockById(this.serviceId, this.bossDriver(chainIdx)));
  }
}
</script>

<template>
  <q-list :class="[{clickable: isDriven}]">
    <div
      v-for="(chain, chainIdx) in textChains"
      :key="chainIdx"
      class="col-auto q-pa-sm q-gutter-x-sm text-indigo-4 row"
      @click="showDialog(chainIdx)"
    >
      <q-tooltip>Edit {{ bossDriver(chainIdx) }}</q-tooltip>
      <q-icon name="mdi-fast-forward-outline" class="col-auto" size="sm" />
      <div class="col-auto">
        <div v-for="text in chain" :key="text">
          <small class="darkish" v-html="text" />
        </div>
      </div>
    </div>
    <div v-if="!isDriven" class="col-auto q-pa-sm darkish text-italic">
      <small>Not driven</small>
    </div>
  </q-list>
</template>
