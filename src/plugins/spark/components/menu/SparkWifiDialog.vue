<script setup lang="ts">
import SparkEspWifiCard from './SparkEspWifiCard.vue';
import SparkParticleWifiCard from './SparkParticleWifiCard.vue';
import {
  UseDialogEmits,
  UseDialogProps,
  useDialog,
  useGlobals,
} from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { computed } from 'vue';

interface Props extends UseDialogProps {
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const sparkStore = useSparkStore();
const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup();
const { dense } = useGlobals.setup();

const platformVendor = computed<'esp' | 'particle' | 'sim' | 'unknown'>(() => {
  const status = sparkStore.statusByService(props.serviceId);
  const platform = status?.controller?.platform;
  if (platform === 'p1' || platform === 'photon') {
    return 'particle';
  }
  if (platform === 'esp32') {
    return 'esp';
  }
  if (platform === 'gcc') {
    return 'sim';
  }
  return 'unknown';
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogOpts"
    @hide="onDialogHide"
  >
    <SparkEspWifiCard
      v-if="platformVendor === 'esp'"
      :service-id="serviceId"
      @cancel="onDialogHide"
    />
    <SparkParticleWifiCard
      v-else
      :service-id="serviceId"
      @cancel="onDialogHide"
    />
  </q-dialog>
</template>
