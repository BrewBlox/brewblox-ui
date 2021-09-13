<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';

import SparkEspWifiCard from './SparkEspWifiCard.vue';
import SparkParticleWifiCard from './SparkParticleWifiCard.vue';

export default defineComponent({
  name: 'SparkWifiMenu',
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
    const { dialogRef, dialogProps, onDialogHide } = useDialog.setup();
    const { dense } = useGlobals.setup();

    const platformVendor = computed<'esp' | 'particle' | 'sim' | 'unknown'>(
      () => {
        const module = sparkStore.moduleById(props.serviceId);
        const platform = module?.status?.devicePlatform;
        console.log(platform);
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
