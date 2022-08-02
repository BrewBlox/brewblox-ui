<script lang="ts">
import { TiltService } from '@/plugins/tilt/types';
import { Service, useServiceStore } from '@/store/services';
import { useSystemStore } from '@/store/system';
import { userUISettings } from '@/user-settings';
import {
  startChangeServiceDir,
  startChangeServiceTitle,
  startRemoveService,
} from '@/utils/services';
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';

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
      get: () =>
        userUISettings.value.homePage === `/service/${props.serviceId}`,
      set: (v) => {
        const homePage =
          v && service.value ? `/service/${props.serviceId}` : null;
        systemStore.patchUserUISettings({ homePage });
      },
    });

    function removeService(service: Maybe<Service>): void {
      startRemoveService(service, router);
    }

    return {
      startChangeServiceDir,
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
      icon="edit"
      label="Change service directory"
      @click="startChangeServiceDir(service)"
    />
    <ActionItem
      icon="delete"
      label="Remove service from UI"
      @click="removeService(service)"
    />
  </ActionSubmenu>
</template>
