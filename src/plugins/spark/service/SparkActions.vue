<script lang="ts">
import { computed, defineComponent } from 'vue';

import { cleanUnusedNames, discoverBlocks, saveHwInfo, startResetBlocks } from '@/plugins/spark/utils';
import { createBlockWizard } from '@/plugins/wizardry';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';
import { createDialog, startChangeServiceTitle, startRemoveService } from '@/utils';

import { SparkServiceModule, sparkStore } from '../store';
import { SparkService } from '../types';

export default defineComponent({
  name: 'SparkActions',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(props.serviceId),
    );

    const service = computed<SparkService | null>(
      () => serviceStore.serviceById(props.serviceId),
    );

    const isHomePage = computed<boolean>({
      get: () => systemStore.config.homePage === `/service/${props.serviceId}`,
      set: v => {
        const homePage = v && service.value ? `/service/${props.serviceId}` : null;
        systemStore.saveConfig({ homePage });
      },
    });

    function serviceReboot(): void {
      sparkModule.value?.serviceReboot();
    }

    function controllerReboot(): void {
      sparkModule.value?.controllerReboot();
    }

    function startDialog(component: string): void {
      if (sparkModule.value) {
        createDialog({
          component,
          componentProps: {
            serviceId: props.serviceId,
          },
        });
      }
    }

    return {
      startResetBlocks,
      saveHwInfo,
      discoverBlocks,
      createBlockWizard,
      cleanUnusedNames,
      startChangeServiceTitle,
      startRemoveService,
      sparkModule,
      service,
      isHomePage,
      serviceReboot,
      controllerReboot,
      startDialog,
    };
  },
});
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
        @click="createBlockWizard(serviceId)"
      />
      <ActionItem
        icon="mdi-magnify-plus-outline"
        label="Discover new OneWire blocks"
        @click="discoverBlocks(serviceId)"
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
        @click="saveHwInfo(serviceId)"
      />
      <ActionItem
        icon="mdi-tag-remove"
        label="Remove unused block names"
        @click="cleanUnusedNames(serviceId)"
      />
      <ActionItem
        icon="delete"
        label="Remove all blocks"
        @click="startResetBlocks(serviceId)"
      />
      <ToggleAction
        v-model="isHomePage"
        icon="home"
        :label="isHomePage ? 'Is home page' : 'Make home page'"
      />
      <ActionItem
        icon="edit"
        label="Rename service"
        @click="startChangeServiceTitle(service)"
      />
      <ActionItem
        icon="delete"
        label="Remove service from UI"
        @click="startRemoveService(service)"
      />
    </template>
  </ActionSubmenu>
</template>
