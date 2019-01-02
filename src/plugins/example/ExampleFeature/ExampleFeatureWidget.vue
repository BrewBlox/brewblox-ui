<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
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

  saveConfig(cfg: ExampleWidgetConfig) {
    // This function must be called to persist the configuration in VueX and the datastore.
    // `this.widgetId` is inherited from WidgetBase.
    // `this.widgetCfg` will be automatically updated when the store is updated.
    this.$props.onConfigChange(this.widgetId, { ...cfg });
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

  created() {
    // created() is a standard Vue lifecycle function (https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
    // It will be called after the properties are injected, but before the HTML is rendered.
    this.url = this.widgetCfg.lastUrl;
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-card-title class="title-bar">
      <!--
        InputPopupEdit is a generic component, defined in src/components/Widget/.
        When clicked, it will display a popup with an edit field and an accept button.

        PopupEdits are used throughout the application.
        An important use case is that they "freeze" their value while open.
        This prevents updates to the VueX store from changing the value the user is currently editing.
      -->
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        label="Widget ID"
        display="span"
      />
      <!-- displayName is inherited from WidgetBase. The value is defined in the Feature definition (./index.ts) -->
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
    </q-card-title>
    <q-card-separator/>
    <!-- The input fields and buttons at the top of the card are defined here -->
    <q-card-main class="row">
      <q-input v-model="url" class="col"/>
      <q-btn label="External" @click="fetchExternal"/>
      <q-btn label="Backend" @click="fetchBackend"/>
    </q-card-main>
    <!--
      All messages from the VueX store are displayed here.
      The list will re-render when a message is added or removed
    -->
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
