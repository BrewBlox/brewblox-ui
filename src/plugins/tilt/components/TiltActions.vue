<script lang="ts">
import { TiltService } from '@/plugins/tilt/types';
import { Service, useServiceStore } from '@/store/services';
import { useSystemStore } from '@/store/system';
import { userUISettings } from '@/user-settings';
import { startChangeServiceTitle, startRemoveService } from '@/utils/services';
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

    const listed = computed<boolean>({
      get: () => service.value?.listed ?? true,
      set: (v) => {
        if (service.value) {
          serviceStore.saveService({ ...service.value, listed: v });
        }
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
      listed,
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
    <ToggleAction
      v-model="listed"
      label="Show in sidebar"
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
