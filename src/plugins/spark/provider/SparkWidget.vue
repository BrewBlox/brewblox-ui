<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import serviceStore from '@/store/services';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { sysInfoType, ticksType, wifiType, isReady } from './getters';
import { SysInfoBlock, TicksBlock, WiFiSettingsBlock } from './types';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkWidget extends Vue {

  get service() {
    return serviceStore.serviceById(this.$props.serviceId);
  }

  sysBlock<T extends Block>(blockType: string) {
    return sparkStore.blockValues(this.service.id)
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
    return isReady(this.service.id);
  }

  get updating() {
    return sparkStore.updateSource(this.service.id) !== null;
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  fetchAll() {
    sparkStore.fetchAll(this.service.id);
  }

  retryUpdateSource() {
    sparkStore.fetchServiceStatus(this.service.id);
    sparkStore.createUpdateSource(this.service.id);
  }
}
</script>

<template>
  <q-card v-if="ready" dark class="text-white scroll">
    <WidgetToolbar :title="service.id" subtitle="Spark Service">
      <q-item-section class="dense" side>
        <q-btn flat round dense icon="refresh" @click="fetchAll"/>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-item v-if="!updating" dark>
        <q-item-section avatar>
          <q-icon name="warning" color="warning"/>
        </q-item-section>
        <q-item-section>Unable to update automatically</q-item-section>
        <q-item-section side>
          <q-btn label="Retry" color="warning" outline @click="retryUpdateSource"/>
        </q-item-section>
      </q-item>

      <q-list>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Version</q-item-label>
            <span>{{ sysInfo.data.version }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>IP address</q-item-label>
            <span>{{ wifi.data.ip }}</span>
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
