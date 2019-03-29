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

      <q-list dense>
        <q-item dark>
          <q-item-section>Device ID</q-item-section>
          <q-item-section style="word-wrap: break-word;">{{ sysInfo.data.deviceId }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Time since boot</q-item-section>
          <q-item-section>{{ ticks.data.millisSinceBoot | duration }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Device time</q-item-section>
          <q-item-section>{{ sysDate }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Version</q-item-section>
          <q-item-section>{{ sysInfo.data.version }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>IP address</q-item-section>
          <q-item-section>{{ wifi.data.ip }}</q-item-section>
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
