<script setup lang="ts">
import { computed } from 'vue';
import { TiltService } from '@/plugins/tilt/types';
import { useServiceStore } from '@/store/services';
import { useSystemStore } from '@/store/system';
import { userUISettings } from '@/user-settings';
import { startChangeServiceTitle, startRemoveService } from '@/utils/services';

interface Props {
  serviceId: string;
}

const props = defineProps<Props>();

const systemStore = useSystemStore();
const serviceStore = useServiceStore();

const service = computed<TiltService | null>(() =>
  serviceStore.serviceById(props.serviceId),
);

const isHomePage = computed<boolean>({
  get: () => userUISettings.value.homePage === `/service/${props.serviceId}`,
  set: (v) => {
    const homePage = v && service.value ? `/service/${props.serviceId}` : null;
    systemStore.patchUserUISettings({ homePage });
  },
});
</script>

<template>
  <ActionSubmenu>
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
  </ActionSubmenu>
</template>
