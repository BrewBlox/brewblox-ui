<script lang="ts">
import { Notify } from 'quasar';
import { computed, defineComponent, ref, watch } from 'vue';

import { systemStore } from '@/store/system';

export default defineComponent({
  name: 'ConfigWatcher',
  setup() {
    const notifyHandle = ref<(() => unknown) | null>(null);

    const userDefinedUnits = computed<boolean>(
      () => systemStore.userDefinedUnits,
    );

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
            handler: () => systemStore.saveUnits({ temperature: 'degC' }),
          },
          {
            label: 'Fahrenheit',
            textColor: 'white',
            handler: () => systemStore.saveUnits({ temperature: 'degF' }),
          },
        ],
      }) as (() => unknown);
    }

    watch(
      () => userDefinedUnits.value,
      (newV) => {
        if (!newV) {
          showPrompt();
        }
        else if (notifyHandle.value) {
          notifyHandle.value();
          notifyHandle.value = null;
        }
      },
      { immediate: true },
    );

    function render(): null {
      return null;
    }

    return render;
  },
});
</script>
