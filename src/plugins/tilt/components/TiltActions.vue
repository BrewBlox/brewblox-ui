<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import { TiltService } from '@/plugins/tilt/types';
import { Service, useServiceStore } from '@/store/services';
import { useSystemStore } from '@/store/system';
import { startChangeServiceTitle, startRemoveService } from '@/utils/services';

export default defineComponent({
  name: 'TiltActions',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const systemStore = useSystemStore();
    const serviceStore = useServiceStore();
    const router = useRouter();

    const service = computed<TiltService | null>(() =>
      serviceStore.serviceById(props.serviceId),
    );

    const serviceTitle = computed<string>(
      () => service.value?.title || `Tilt ${props.serviceId}`,
    );

    const isHomePage = computed<boolean>({
      get: () => systemStore.config.homePage === `/service/${props.serviceId}`,
      set: (v) => {
        const homePage =
          v && service.value ? `/service/${props.serviceId}` : null;
        systemStore.saveConfig({ homePage });
      },
    });

    function removeService(service: Maybe<Service>): void {
      startRemoveService(service, router);
    }

    return {
      startChangeServiceTitle,
      removeService,
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
      @click="removeService(service)"
    />
  </ActionSubmenu>
</template>
