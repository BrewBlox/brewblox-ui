<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { blockTypes, SysInfoBlock, TicksBlock, WiFiSettingsBlock } from '../block-types';
import { isReady } from './getters';

@Component
export default class SparkWidget extends Vue {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  sysBlock<T extends Block>(blockType: string): T {
    return sparkStore.blockValues(this.serviceId)
      .find(block => block.type === blockType) as T;
  }

  get sysInfo(): SysInfoBlock {
    return this.sysBlock(blockTypes.SysInfo);
  }

  get ticks(): TicksBlock {
    return this.sysBlock(blockTypes.Ticks);
  }

  get wifi(): WiFiSettingsBlock {
    return this.sysBlock(blockTypes.WiFiSettings);
  }

  get ready(): boolean {
    return isReady(this.serviceId);
  }

  get updating(): boolean {
    return sparkStore.updateSource(this.serviceId) !== null;
  }

  get sysDate(): string {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  fetchAll(): void {
    sparkStore.fetchAll(this.serviceId);
    sparkStore.fetchBlocks(this.serviceId);
  }

  retryUpdateSource(): void {
    sparkStore.fetchServiceStatus(this.serviceId);
    sparkStore.createUpdateSource(this.serviceId);
  }
}
</script>

<template>
  <q-card v-if="ready" class="text-white scroll">
    <Toolbar :title="serviceId" subtitle="Device Info">
      <template #buttons>
        <q-btn flat round icon="refresh" class="darkish" @click="fetchAll" />
      </template>
    </Toolbar>

    <CardWarning v-if="!updating">
      <template #message>
        <span>Unable to update automatically</span>
      </template>
      <template #actions>
        <q-btn label="Retry" color="warning" outline @click="retryUpdateSource" />
      </template>
    </CardWarning>

    <q-card-section>
      <q-list dense>
        <q-item>
          <q-item-section>
            <ValueField :value="sysInfo.data.version" label="Firmware version" />
          </q-item-section>
          <q-item-section>
            <ValueField :value="sysInfo.data.releaseDate" label="Firmware release date" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <ValueField :value="sysDate" label="Device time" />
          </q-item-section>
          <q-item-section>
            <ValueField label="Time since boot">
              {{ ticks.data.millisSinceBoot | duration }}
            </ValueField>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <ValueField label="Device ID">
              <span style="word-wrap: break-word;">{{ sysInfo.data.deviceId }}</span>
            </ValueField>
          </q-item-section>
          <q-item-section>
            <ValueField :value="wifi.data.ip" label="IP address" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
