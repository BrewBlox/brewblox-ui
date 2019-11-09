<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
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
    showBlockDialog(sparkStore.tryBlockById(this.serviceId, this.bossDriver(chainIdx)));
  }
}
</script>

<template>
  <q-list dark no-border>
    <q-item
      v-for="(chain, chainIdx) in textChains"
      :key="chainIdx"
      clickable
      dark
      style="padding: 5px 0; min-height: 0"
      @click="showDialog(chainIdx)"
    >
      <q-tooltip>Edit {{ bossDriver(chainIdx) }}</q-tooltip>
      <q-item-section class="q-mr-md">
        <div v-for="text in chain" :key="text">
          <small class="darkish" v-html="text" />
        </div>
      </q-item-section>
      <q-item-section side>
        <q-icon name="mdi-pencil" />
      </q-item-section>
    </q-item>
    <!-- Display message if not driven -->
    <q-item v-if="!isDriven" dark style="padding: 5px 0; min-height: 0;">
      <q-item-section>
        <small class="darkish">Not driven</small>
      </q-item-section>
      <q-item-section side>
        <q-icon name="mdi-pencil-off" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
