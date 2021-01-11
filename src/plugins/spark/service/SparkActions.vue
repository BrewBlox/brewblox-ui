<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { startChangeServiceTitle, startRemoveService } from '@/helpers/services';
import { cleanUnusedNames, discoverBlocks, saveHwInfo, startResetBlocks } from '@/plugins/spark/helpers';
import { createBlockWizard } from '@/plugins/wizardry';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';

import { SparkServiceModule, sparkStore } from '../store';
import { SparkService } from '../types';


@Component
export default class SparkActions extends Vue {
  funcs = {
    startResetBlocks,
    saveHwInfo,
    discoverBlocks,
    createBlockWizard,
    cleanUnusedNames,
    startChangeServiceTitle,
    startRemoveService,
  }

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get service(): SparkService | null {
    return serviceStore.serviceById(this.serviceId);
  }

  get serviceTitle(): string {
    return this.service?.title || `Spark '${this.serviceId}'`;
  }

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get isHomePage(): boolean {
    return systemStore.config.homePage === `/service/${this.service?.id}`;
  }

  set isHomePage(v: boolean) {
    const homePage = v && this.service ? `/service/${this.service.id}` : null;
    systemStore.saveConfig({ homePage });
  }

  serviceReboot(): void {
    this.sparkModule?.serviceReboot();
  }

  controllerReboot(): void {
    this.sparkModule?.controllerReboot();
  }

  startDialog(component: string): void {
    if (!this.sparkModule) { return; }
    createDialog({
      component,
      serviceId: this.serviceId,
    });
  }

}
</script>

<template>
  <ActionSubmenu>
    <CardWarning v-if="!sparkModule">
      <template #message>
        Service is not available
      </template>
    </CardWarning>
    <template v-else>
      <ActionItem
        icon="add"
        label="New block"
        @click="funcs.createBlockWizard(serviceId)"
      />
      <ActionItem
        icon="mdi-magnify-plus-outline"
        label="Discover new OneWire blocks"
        @click="funcs.discoverBlocks(serviceId)"
      />
      <ActionItem
        icon="mdi-progress-download"
        label="Update firmware"
        @click="startDialog('FirmwareUpdateDialog')"
      />
      <ActionItem
        icon="wifi"
        label="Configure Wifi"
        @click="startDialog('SparkWifiMenu')"
      />
      <!-- <ActionItem
        icon="mdi-checkbox-multiple-marked"
        label="Groups (deprecated)"
        @click="startDialog('SparkGroupMenu')"
      /> -->
      <ActionItem
        icon="mdi-restart"
        label="Reboot service"
        @click="serviceReboot"
      />
      <ActionItem
        icon="mdi-restart"
        label="Reboot controller"
        @click="controllerReboot"
      />
      <ActionItem
        icon="mdi-file-export"
        label="Import/Export blocks"
        @click="startDialog('SparkImportMenu')"
      />
      <ActionItem
        icon="mdi-power-plug"
        label="Export sensor and pin names"
        @click="funcs.saveHwInfo(serviceId)"
      />
      <ActionItem
        icon="mdi-tag-remove"
        label="Remove unused block names"
        @click="funcs.cleanUnusedNames(serviceId)"
      />
      <ActionItem
        icon="delete"
        label="Remove all blocks"
        @click="funcs.startResetBlocks(serviceId)"
      />
      <ToggleAction
        v-model="isHomePage"
        icon="home"
        :label="isHomePage ? 'Is home page' : 'Make home page'"
      />
      <ActionItem
        icon="edit"
        label="Rename service"
        @click="funcs.startChangeServiceTitle(service)"
      />
      <ActionItem
        icon="delete"
        label="Remove service from UI"
        @click="funcs.startRemoveService(service)"
      />
    </template>
  </ActionSubmenu>
</template>
