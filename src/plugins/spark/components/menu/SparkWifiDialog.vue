<script lang="ts">
import { useDialog, useGlobals } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { computed, defineComponent } from 'vue';
import SparkEspWifiCard from './SparkEspWifiCard.vue';
import SparkParticleWifiCard from './SparkParticleWifiCard.vue';

export default defineComponent({
  name: 'SparkWifiDialog',
  components: {
    SparkEspWifiCard,
    SparkParticleWifiCard,
  },
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const { dialogRef, dialogProps, onDialogHide } = useDialog.setup();
    const { dense } = useGlobals.setup();

    const platformVendor = computed<'esp' | 'particle' | 'sim' | 'unknown'>(
      () => {
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
      },
    );

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      dense,
      platformVendor,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogProps"
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
