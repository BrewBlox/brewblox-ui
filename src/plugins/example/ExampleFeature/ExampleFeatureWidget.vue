<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { MODULE_ID } from '@/plugins/example';
import { messages } from '@/plugins/example/store/getters';
import { removeMessage } from '@/plugins/example/store/mutations';
import { fetchExternal, fetchBackend } from '@/plugins/example/store/actions';
import { ExampleWidgetConfig } from '@/plugins/example/ExampleFeature/state';

@Component
export default class ExampleFeatureWidget extends WidgetBase {
  url: string = '';

  get widgetCfg(): ExampleWidgetConfig {
    return this.$props.config;
  }

  get messages() {
    return messages(this.$store, MODULE_ID);
  }

  saveConfig(cfg: ExampleWidgetConfig) {
    this.$props.onConfigChange(this.widgetId, { ...cfg });
  }

  fetchBackend() {
    this.saveConfig({ lastUrl: this.url });
    fetchBackend(this.$store, MODULE_ID, this.url);
  }

  fetchExternal() {
    this.saveConfig({ lastUrl: this.url });
    fetchExternal(this.$store, MODULE_ID, this.url);
  }

  removeMessage(idx: number) {
    removeMessage(this.$store, MODULE_ID, idx);
  }

  mounted() {
    this.url = this.widgetCfg.lastUrl;
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        label="Widget ID"
        display="span"
        :change="v => widgetId = v"
      />
      <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="row">
      <q-input class="col" v-model="url"/>
      <q-btn label="External" @click="fetchExternal"/>
      <q-btn label="Backend" @click="fetchBackend"/>
    </q-card-main>
    <q-list>
      <q-item v-for="(msg, idx) in messages" :key="idx">
        <q-item-side :icon="msg.ok ? 'check_circle' : 'error'"/>
        <q-item-main>
          <q-item-tile>{{ msg.url }}</q-item-tile>
          <q-item-tile>{{ msg.content }}</q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-btn round icon="delete" @click="removeMessage(idx)"/>
        </q-item-side>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped>
</style>
