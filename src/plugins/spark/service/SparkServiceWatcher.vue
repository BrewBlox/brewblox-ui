<script lang="ts">
import { useQuasar } from 'quasar';
import { PropType, computed, defineComponent, inject, ref, watch } from 'vue';

import { useSparkStore } from '@/plugins/spark/store';
import type { SparkService, SparkStatus } from '@/plugins/spark/types';
import { NowKey } from '@/symbols';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import { durationMs } from '@/utils/quantity';

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
    const sparkStore = useSparkStore();

    const serviceId = computed<string>(() => props.service.id);

    const status = computed<SparkStatus | null>(() =>
      sparkStore.statusByService(serviceId.value),
    );

    const cookieName = computed<string>(() => `fw-snooze-${props.service.id}`);

    const snoozeTime = computed<number>(() =>
      $q.cookies.has(cookieName.value)
        ? Date.parse($q.cookies.get(cookieName.value))
        : 0,
    );

    function fresh(date: Date | null): boolean {
      return (
        !!date && date.getTime() + updateValidDuration > new Date().getTime()
      );
    }

    watch(
      () => now.value,
      () => {
        if (!sparkStore.has(serviceId.value)) {
          return;
        }
        const blocksDate = sparkStore.lastBlocksAtByService(serviceId.value);
        const statusDate = sparkStore.lastStatusAtByService(serviceId.value);
        const blocksFresh = fresh(blocksDate);
        const statusFresh = fresh(statusDate);

        // The last received set of blocks are stale.
        // Remove them.
        if (!blocksFresh && blocksDate) {
          sparkStore.invalidateBlocks(serviceId.value);
        }

        // The last received status update is stale.
        // Query the service for an update.
        if (!statusFresh) {
          sparkStore.fetchAll(serviceId.value);
        }
      },
    );

    watch(
      () => status.value,
      (status: SparkStatus | null) => {
        if (
          notifiedUpdate.value ||
          !status ||
          !status.isConnected ||
          status.isLatestFirmware ||
          snoozeTime.value > new Date().getTime() - snoozeDuration
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
              handler: () =>
                createDialog({
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
              handler: () =>
                $q.cookies.set(cookieName.value, new Date().toUTCString()),
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
