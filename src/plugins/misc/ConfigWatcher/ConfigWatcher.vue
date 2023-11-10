<script setup lang="ts">
import { Notify } from 'quasar';
import { ref, watch } from 'vue';
import { useSystemStore } from '@/store/system';
import { userUnitsDefined } from '@/user-settings';

const systemStore = useSystemStore();
const notifyHandle = ref<(() => unknown) | null>(null);

function showPrompt(): void {
  notifyHandle.value = Notify.create({
    message: 'Please select how temperatures should be displayed',
    html: true,
    icon: 'mdi-thermometer',
    timeout: 0,
    actions: [
      {
        label: 'Celsius',
        textColor: 'white',
        handler: () => systemStore.patchUserUnits({ temperature: 'degC' }),
      },
      {
        label: 'Fahrenheit',
        textColor: 'white',
        handler: () => systemStore.patchUserUnits({ temperature: 'degF' }),
      },
    ],
  }) as () => unknown;
}

watch(
  () => userUnitsDefined.value,
  (newV) => {
    if (!newV) {
      showPrompt();
    } else if (notifyHandle.value) {
      notifyHandle.value();
      notifyHandle.value = null;
    }
  },
  { immediate: true },
);

const render = (): null => null;
</script>

<template>
  <render />
</template>
