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
  <q-card v-if="ready" dark class="column">
    <q-modal v-model="modalOpen">
      <SparkForm v-if="modalOpen" :field="service"/>
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="service.id"
        :change="() => {}"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">Spark Service</span>
      <q-btn slot="right" flat round dense icon="settings" @click="modalOpen = true"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="fetchAll"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-alert
          v-if="!updating"
          :actions="[{ label: 'Retry', handler: retryUpdateSource }]"
          type="warning"
        >Unable to update automatically</q-alert>
        <q-field label="Device ID">
          <big style="word-wrap: break-word;">{{ sysInfo.data.deviceId }}</big>
        </q-field>
        <q-field label="IP address">
          <big>{{ wifi.data.ip }}</big>
        </q-field>
        <q-field label="Time since boot">
          <big>{{ ticks.data.millisSinceBoot | duration }}</big>
        </q-field>
        <q-field label="Date">
          <big>{{ sysDate }}</big>
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>
