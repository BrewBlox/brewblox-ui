<script lang="ts">
import { computed, defineComponent } from 'vue';

import { TiltService } from '@/plugins/tilt/types';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';
import { startChangeServiceTitle, startRemoveService } from '@/utils';

export default defineComponent({
  name: 'TiltActions',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const service = computed<TiltService | null>(
      () => serviceStore.serviceById(props.serviceId),
    );

    const serviceTitle = computed<string>(
      () => service.value?.title || `Tilt ${props.serviceId}`,
    );

    const isHomePage = computed<boolean>({
      get: () => systemStore.config.homePage === `/service/${props.serviceId}`,
      set: v => {
        const homePage = (v && service.value) ? `/service/${props.serviceId}` : null;
        systemStore.saveConfig({ homePage });
      },
    });

    return {
      startChangeServiceTitle,
      startRemoveService,
      service,
      serviceTitle,
      isHomePage,
    };
  },
});
</script>

<template>
  <ActionSubmenu :label="serviceTitle">
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
  </ActionSubmenu>
</template>
