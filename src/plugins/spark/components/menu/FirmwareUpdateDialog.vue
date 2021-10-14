<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  ref,
} from 'vue';

import { useDialog } from '@/composables';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { useSparkStore } from '@/plugins/spark/store';
import { SparkStatus } from '@/plugins/spark/types';
import { isSparkUpdate } from '@/plugins/spark/utils';

export default defineComponent({
  name: 'FirmwareUpdateDialog',
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

    const busy = ref<boolean>(false);
    const error = ref<string>('');
    const listenerId = ref<string>('');
    const messages = reactive<string[]>([]);

    onBeforeMount(() => {
      listenerId.value = eventbus.addListener(
        `${STATE_TOPIC}/${props.serviceId}/update`,
        (_, evt) => {
          if (isSparkUpdate(evt)) {
            evt.data.log.forEach((v) => messages.push(v));
          }
        },
      );
    });

    onBeforeUnmount(() => {
      eventbus.removeListener(listenerId.value);
    });

    const status = computed<SparkStatus | null>(() =>
      sparkStore.statusByService(props.serviceId),
    );

    const updateAvailableText = computed<string>(() => {
      const latest = status.value?.isLatestFirmware;
      return latest === undefined
        ? 'Current firmware version is unknown.'
        : latest
        ? "You're using the latest firmware."
        : 'A firmware update is available.';
    });

    const ready = computed<boolean>(() => Boolean(status.value?.isConnected));

    const buttonColor = computed<string>(() =>
      status.value?.isLatestFirmware ? '' : 'primary',
    );

    function updateFirmware(): void {
      if (busy.value || !ready.value) {
        return;
      }
      busy.value = true;
      error.value = '';
      messages.length = 0;

      sparkStore
        .flashFirmware(props.serviceId)
        .catch((e) => {
          error.value = e.message;
        })
        .finally(() => {
          busy.value = false;
        });
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      busy,
      error,
      messages,
      updateAvailableText,
      ready,
      buttonColor,
      updateFirmware,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="updateFirmware"
  >
    <Card>
      <template #toolbar>
        <Toolbar :title="serviceId" subtitle="Firmware update" />
      </template>

      <q-card-section>
        <div v-if="error" class="text-negative q-pa-md">
          <div>Update failed: {{ error }}</div>
          Please retry. <br>
          If the retry fails, run `brewblox-ctl flash`
        </div>

        <div v-if="messages.length === 0" class="q-pa-md">
          {{ updateAvailableText }}
        </div>
        <template v-else>
          <div class="text-h6 q-pa-md">
            Log messages
          </div>
          <div class="q-gutter-sm q-px-md monospace">
            <div v-for="(msg, idx) in messages" :key="`msg-${idx}`">
              {{ msg }}
            </div>
          </div>
        </template>
      </q-card-section>

      <template #actions>
        <q-btn
          :disable="busy || !ready"
          :loading="busy || !ready"
          :color="buttonColor"
          unelevated
          label="Flash"
          @click="updateFirmware"
        />
      </template>
    </Card>
  </q-dialog>
</template>
