<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { isReady, sysInfoType, ticksType, wifiType } from './getters';
import { SysInfoBlock, TicksBlock, WiFiSettingsBlock } from './types';

@Component
export default class SparkWidget extends Vue {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  sysBlock<T extends Block>(blockType: string) {
    return sparkStore.blockValues(this.serviceId)
      .find(block => block.type === blockType) as T;
  }

  get sysInfo() {
    return this.sysBlock<SysInfoBlock>(sysInfoType);
  }

  get ticks() {
    return this.sysBlock<TicksBlock>(ticksType);
  }

  get wifi() {
    return this.sysBlock<WiFiSettingsBlock>(wifiType);
  }

  get ready() {
    return isReady(this.serviceId);
  }

  get updating() {
    return sparkStore.updateSource(this.serviceId) !== null;
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  fetchAll() {
    sparkStore.fetchAll(this.serviceId);
  }

  retryUpdateSource() {
    sparkStore.fetchServiceStatus(this.serviceId);
    sparkStore.createUpdateSource(this.serviceId);
  }
}
</script>

<template>
  <q-card v-if="ready" dark class="text-white scroll">
    <WidgetToolbar :title="serviceId" subtitle="Spark Service">
      <q-item-section class="dense" side>
        <q-btn flat round dense icon="refresh" @click="fetchAll" />
      </q-item-section>
    </WidgetToolbar>

    <CardWarning v-if="!updating">
      <template #message>
        <span>Unable to update automatically</span>
      </template>
      <template #actions>
        <q-btn label="Retry" color="warning" outline @click="retryUpdateSource" />
      </template>
    </CardWarning>

    <q-card-section>
      <q-list>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Firmware version</q-item-label>
            <span>{{ sysInfo.data.version }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Firmware release date</q-item-label>
            <span>{{ sysInfo.data.releaseDate }}</span>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Device time</q-item-label>
            <span>{{ sysDate }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Time since boot</q-item-label>
            <span>{{ ticks.data.millisSinceBoot | duration }}</span>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Device ID</q-item-label>
            <span style="word-wrap: break-word;">{{ sysInfo.data.deviceId }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>IP address</q-item-label>
            <span>{{ wifi.data.ip }}</span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
