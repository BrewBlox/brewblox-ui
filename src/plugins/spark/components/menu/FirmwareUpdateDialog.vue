<script lang="ts">
import { useDialog } from '@/composables';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { useSparkStore } from '@/plugins/spark/store';
import { isSparkUpdate } from '@/plugins/spark/utils/info';
import {
  SparkControllerDescription,
  SparkServiceDescription,
  SparkStatusDescription,
} from 'brewblox-proto/ts';
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  ref,
} from 'vue';

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

    const status = computed<SparkStatusDescription | null>(() =>
      sparkStore.statusByService(props.serviceId),
    );

    const updateAvailableText = computed<string>(() => {
      if (!status.value) {
        return 'The service is not connected: firmware status is unknown.';
      }

      const { firmware_error, controller, service } = status.value;
      if (controller == null) {
        return 'The service is not connected to a controller.';
      }

      if (firmware_error == null) {
        return "You're using the latest firmware.";
      }

      if (controller.firmware.firmware_date > service.firmware.firmware_date) {
        return 'The controller firmware is newer than the service firmware.';
      }

      return 'A firmware update is available';
    });

    const ready = computed<boolean>(() => {
      const cs = status.value?.connection_status;
      return cs != null && (cs === 'ACKNOWLEDGED' || cs === 'SYNCHRONIZED');
    });

    function firmwareText(
      arg: SparkServiceDescription | SparkControllerDescription | null,
    ): string {
      return arg
        ? `${arg.firmware.firmware_version} (${arg.firmware.firmware_date})`
        : 'Unknown';
    }

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
      status,
      busy,
      error,
      messages,
      updateAvailableText,
      ready,
      firmwareText,
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
        <Toolbar
          :title="serviceId"
          subtitle="Firmware update"
        />
      </template>

      <q-card-section>
        <div class="q-pa-md">
          <b>{{ updateAvailableText }}</b>
          <template v-if="status">
            <br />
            Service firmware: {{ firmwareText(status.service) }}
            <br />
            Controller firmware: {{ firmwareText(status.controller) }}
          </template>
        </div>

        <div
          v-if="error"
          class="text-negative q-pa-md"
        >
          <div>Update failed: {{ error }}</div>
          Please retry. <br />
          If the retry fails, run `brewblox-ctl flash`
        </div>

        <template v-if="messages.length > 0">
          <div class="text-h6 q-pa-md">Log messages</div>
          <div class="q-gutter-sm q-px-md monospace">
            <div
              v-for="(msg, idx) in messages"
              :key="`msg-${idx}`"
            >
              {{ msg }}
            </div>
          </div>
        </template>
      </q-card-section>

      <template #actions>
        <q-btn
          :disable="busy || !ready"
          :loading="busy || !ready"
          :color="status && status.firmware_error ? 'primary' : ''"
          unelevated
          label="Flash"
          @click="updateFirmware"
        />
      </template>
    </Card>
  </q-dialog>
</template>
