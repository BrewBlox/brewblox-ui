<script setup lang="ts">
import { computed } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { SparkService } from '@/plugins/spark/types';
import {
  discoverBlocks,
  startResetBlocks,
} from '@/plugins/spark/utils/actions';
import { useServiceStore } from '@/store/services';
import { useSystemStore } from '@/store/system';
import { userUISettings } from '@/user-settings';
import { createDialog, GlobalDialogName } from '@/utils/dialog';
import { startChangeServiceTitle, startRemoveService } from '@/utils/services';

interface Props {
  serviceId: string;
}

const props = defineProps<Props>();

const systemStore = useSystemStore();
const serviceStore = useServiceStore();
const sparkStore = useSparkStore();

const service = computed<SparkService | null>(() =>
  serviceStore.serviceById(props.serviceId),
);

const isHomePage = computed<boolean>({
  get: () => userUISettings.value.homePage === `/service/${props.serviceId}`,
  set: (v) => {
    const homePage = v && service.value ? `/service/${props.serviceId}` : null;
    systemStore.patchUserUISettings({ homePage });
  },
});

function serviceReboot(): void {
  sparkStore.serviceReboot(props.serviceId);
}

function controllerReboot(): void {
  sparkStore.controllerReboot(props.serviceId);
}

function startDialog(component: GlobalDialogName): void {
  if (sparkStore.has(props.serviceId)) {
    createDialog({
      component,
      componentProps: {
        serviceId: props.serviceId,
      },
    });
  }
}
</script>

<template>
  <ActionSubmenu>
    <CardWarning v-if="!service">
      <template #message> Service is not available </template>
    </CardWarning>
    <template v-else>
      <ActionItem
        icon="add"
        label="New block"
        @click="startDialog('BlockWizardDialog')"
      />
      <ActionItem
        icon="mdi-magnify-plus-outline"
        label="Discover blocks"
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
        @click="startDialog('SparkWifiDialog')"
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
        label="Controller backups"
        @click="startDialog('SparkBackupDialog')"
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
        label="Change service name"
        @click="startChangeServiceTitle(service)"
      />
      <ActionItem
        icon="delete"
        label="Remove service from UI"
        @click="startRemoveService(service, $router)"
      />
    </template>
  </ActionSubmenu>
</template>
