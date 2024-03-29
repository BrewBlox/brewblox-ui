<script setup lang="ts">
import {
  SparkControllerDescription,
  SparkServiceDescription,
  SparkStatusDescription,
} from 'brewblox-proto/ts';
import { computed, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { useSparkStore } from '@/plugins/spark/store';
import { isSparkUpdate } from '@/plugins/spark/utils/info';

type UpdateProgress = 'Pending' | 'Busy' | 'Done';

interface Props extends UseDialogProps {
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const sparkStore = useSparkStore();
const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup<never>();

const progress = ref<UpdateProgress>('Pending');
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
  if (progress.value === 'Busy' || !ready.value) {
    return;
  }
  progress.value = 'Busy';
  error.value = '';
  messages.length = 0;

  sparkStore
    .flashFirmware(props.serviceId)
    .catch((e) => {
      error.value = e.message;
    })
    // There will be some time before the service propagates the restarting state
    .finally(() =>
      setTimeout(() => {
        progress.value = 'Done';
      }, 5000),
    );
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
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
          v-if="
            progress !== 'Done' || !ready || !status || status.firmware_error
          "
          :disable="progress === 'Busy' || !ready"
          :loading="progress === 'Busy' || !ready"
          color="primary"
          unelevated
          label="Flash"
          @click="updateFirmware"
        />
        <q-btn
          v-else
          unelevated
          label="Close"
          @click="onDialogHide"
        />
      </template>
    </Card>
  </q-dialog>
</template>
