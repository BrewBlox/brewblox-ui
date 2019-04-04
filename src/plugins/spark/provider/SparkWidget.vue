<script lang="ts">
import { Block } from '@/plugins/spark/state';
import {
  createUpdateSource,
  fetchAll,
  fetchServiceStatus,
} from '@/plugins/spark/store/actions';
import { updateSource, blockValues } from '@/plugins/spark/store/getters';
import { serviceById } from '@/store/services/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { sysInfoType, ticksType, wifiType, isReady } from './getters';
import { SysInfoBlock, TicksBlock, WiFiSettingsBlock } from './state';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkWidget extends Vue {
  modalOpen: boolean = false;

  get service() {
    return serviceById(this.$store, this.$props.serviceId);
  }

  sysBlock<T extends Block>(blockType: string) {
    return blockValues(this.$store, this.service.id)
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
    return isReady(this.$store, this.service.id);
  }

  get updating() {
    return updateSource(this.$store, this.service.id) !== null;
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  fetchAll() {
    fetchAll(this.$store, serviceById(this.$store, this.service.id));
  }

  retryUpdateSource() {
    fetchServiceStatus(this.$store, this.service.id);
    createUpdateSource(this.$store, this.service.id);
  }
}
</script>

<template>
  <q-card v-if="ready" dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <SparkForm v-if="modalOpen" :field="service"/>
    </q-dialog>

    <WidgetToolbar :title="service.id" subtitle="Spark Service">
      <q-item-section class="dense" side>
        <q-btn flat round dense icon="settings" @click="modalOpen = true"/>
      </q-item-section>
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
