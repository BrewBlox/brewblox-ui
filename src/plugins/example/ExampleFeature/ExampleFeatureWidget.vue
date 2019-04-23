<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { MODULE_ID } from '@/plugins/example';
import { messages } from '@/plugins/example/store/getters';
import { removeMessage } from '@/plugins/example/store/mutations';
import { fetchExternal, fetchBackend } from '@/plugins/example/store/actions';
import { ExampleWidgetConfig } from '@/plugins/example/ExampleFeature/state';

/*
  The WidgetBase class inherits from Vue, we inherit the properties from WidgetBase.
  The dashboard that renders this widget will provide these properties.

  WidgetBase also defines some generic getters, setters, and functions.
*/
@Component
export default class ExampleFeatureWidget extends WidgetBase {
  url: string = '';

  get widgetCfg(): ExampleWidgetConfig {
    // Each widget can place its persistent settings in its config object.
    // These will be saved to the datastore.
    return this.$props.config;
  }

  get messages() {
    // We define a getter for the messages here, so we can access them in the HTML code.
    // The result is cached, and will be automatically updated if the store changes.
    return messages(this.$store, MODULE_ID);
  }

  fetchBackend() {
    // We save the configuration, and call the fetch action.
    // fetchBackend() will update VueX when a result arrives, which will trigger an update of `this.messages`.
    this.saveConfig({ lastUrl: this.url });
    fetchBackend(this.$store, MODULE_ID, this.url);
  }

  fetchExternal() {
    // Same as fetchBackend(), but with a different store action.
    this.saveConfig({ lastUrl: this.url });
    fetchExternal(this.$store, MODULE_ID, this.url);
  }

  removeMessage(idx: number) {
    // We call the VueX mutation from here.
    // `this.messages` will update automatically afterwards.
    removeMessage(this.$store, MODULE_ID, idx);
  }

  alert() {
    // An example notification, triggered by the button on the toolbar
    this.$q.notify({
      color: 'positive',
      icon: 'mdi-message-alert',
      message: `Hi! I'm ${this.widgetTitle}.`,
    });
  }

  created() {
    // created() is a standard Vue lifecycle function (https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
    // It will be called after the properties are injected, but before the HTML is rendered.
    this.url = this.widgetCfg.lastUrl;
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <!-- displayName is inherited from WidgetBase. The value is defined in the Feature definition (./index.ts) -->
    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn flat round icon="mdi-message-alert" @click="alert"/>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <!-- The input fields and buttons at the top of the card are defined here -->
      <q-item dark>
        <q-item-section>
          <q-input v-model="url" dark label="URL"/>
        </q-item-section>
        <q-item-section side>
          <q-btn outline color="white" label="External" @click="fetchExternal"/>
        </q-item-section>
        <q-item-section side>
          <q-btn outline color="white" label="Backend" @click="fetchBackend"/>
        </q-item-section>
      </q-item>
      <!--
      All messages from the VueX store are displayed here.
      The list will re-render when a message is added or removed
      -->
      <q-item v-for="(msg, idx) in messages" :key="idx" dark>
        <q-item-section avatar>
          <q-icon :name="msg.ok ? 'check_circle' : 'error'"/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>{{ msg.url }}</q-item-label>
          {{ msg.content }}
        </q-item-section>
        <q-item-section side>
          <q-btn round icon="delete" @click="removeMessage(idx)"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

