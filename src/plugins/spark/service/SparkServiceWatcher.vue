<script lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineComponent, inject, PropType, ref, watch } from 'vue';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type { SparkService, SparkStatus } from '@/plugins/spark/types';
import { NowKey } from '@/symbols';
import { createDialog, durationMs, notify } from '@/utils';

const snoozeDuration = durationMs('1d');
const updateValidDuration = durationMs('30s');

export default defineComponent({
  name: 'SparkServiceWatcher',
  props: {
    service: {
      type: Object as PropType<SparkService>,
      required: true,
    },
  },
  setup(props) {
    const notifiedUpdate = ref(false);
    const now = inject(NowKey)!;
    const $q = useQuasar();

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(props.service.id),
    );

    const status = computed<SparkStatus | null>(
      () => sparkModule.value?.status ?? null,
    );

    const cookieName = computed<string>(
      () => `fw-snooze-${props.service.id}`,
    );

    const snoozeTime = computed<number>(
      () => $q.cookies.has(cookieName.value)
        ? Date.parse($q.cookies.get(cookieName.value))
        : 0,
    );

    function fresh(date: Date | null): boolean {
      return !!date && date.getTime() + updateValidDuration > new Date().getTime();
    }

    watch(
      () => now.value,
      () => {
        if (!sparkModule.value) {
          return;
        }
        const blocksDate = sparkModule.value.lastBlocks;
        const statusDate = sparkModule.value.lastStatus;
        const blocksFresh = fresh(blocksDate);
        const statusFresh = fresh(statusDate);

        // The last received set of blocks are stale.
        // Remove them.
        if (!blocksFresh && blocksDate) {
          sparkModule.value.invalidateBlocks();
        }

        // The last received status update is stale.
        // Query the service for an update.
        if (!statusFresh) {
          sparkModule.value.fetchAll();
        }
      },
    );

    watch(
      () => status.value,
      (status: SparkStatus | null) => {
        if (notifiedUpdate.value
          || !status
          || !status.isConnected
          || status.isLatestFirmware
          || snoozeTime.value > new Date().getTime() - snoozeDuration
        ) {
          return;
        }

        notifiedUpdate.value = true;
        notify.info({
          timeout: 0,
          icon: 'mdi-download-network',
          message: `Firmware update available for <b>${props.service.title}</b>`,
          actions: [
            {
              label: 'Update',
              textColor: 'white',
              handler: () => createDialog({
                component: 'FirmwareUpdateDialog',
                componentProps: {
                  serviceId: props.service.id,
                },
              }),
            },
            {
              label: 'Dismiss',
              textColor: 'white',
            },
            {
              label: 'Maybe tomorrow',
              textColor: 'white',
              handler: () => $q.cookies.set(cookieName.value, new Date().toUTCString()),
            },
          ],
        });
      },
    );

    function render(): null {
      return null;
    }

    return render;
  },
});
</script>
