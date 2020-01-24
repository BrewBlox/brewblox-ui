<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { pluginStore, UIPlugin, UIPluginResult } from '@/store/plugins';

@Component
export default class PluginDialog extends DialogBase {
  changed = false;

  get combos(): [UIPlugin, UIPluginResult][] {
    return pluginStore.pluginValues
      .map(plugin => [plugin, pluginStore.results[plugin.id]] as [UIPlugin, UIPluginResult]);
  }

  async addPlugin(): Promise<void> {
    createDialog({
      component: 'InputDialog',
      title: 'New Plugin',
      label: 'Package URL',
      clearable: false,
      value: '',
    })
      .onOk(url => pluginStore.createPlugin({ id: uid(), title: '', url }));
  }

  async saveUrl(plugin: UIPlugin, url: string): Promise<void> {
    if (plugin.url !== url) {
      await pluginStore.savePlugin({ ...plugin, url });
      pluginStore.commitResult({ id: plugin.id, loaded: false, error: null });
    }
  }

  async removePlugin(plugin: UIPlugin): Promise<void> {
    await pluginStore.removePlugin(plugin);
  }

  reloadPage(): void {
    location.reload();
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss class="row" @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar title="UI Plugins" />
      </template>

      <q-card-section>
        <q-item v-for="[plugin, result] in combos" :key="plugin.id">
          <q-item-section avatar>
            <template v-if="result.loaded">
              <q-tooltip>Plugin is loaded.</q-tooltip>
              <q-icon name="mdi-check" />
            </template>
            <template v-else-if="!result.error">
              <q-tooltip>Reload the UI to load this plugin.</q-tooltip>
              <q-icon name="mdi-help" />
            </template>
            <template v-else>
              <q-tooltip>{{ result.error }}</q-tooltip>
              <q-icon name="warning" color="warning" />
            </template>
          </q-item-section>
          <q-item-section>
            <InputField
              :value="plugin.url"
              title="Plugin"
              label="Package URL"
              @input="url => saveUrl(plugin, url)"
            />
          </q-item-section>
          <q-item-section class="col-auto">
            <q-tooltip>Remove plugin</q-tooltip>
            <q-btn flat round icon="delete" @click="removePlugin(plugin)" />
          </q-item-section>
        </q-item>
      </q-card-section>

      <template #actions>
        <q-btn flat label="Reload page" @click="reloadPage" />
        <q-btn flat label="Add plugin" @click="addPlugin" />
      </template>
    </ActionCardWrapper>
  </q-dialog>
</template>
