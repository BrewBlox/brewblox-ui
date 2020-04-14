<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkUpdateEvent } from '@/plugins/spark/getters';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { SparkStatus } from '@/plugins/spark/types';


@Component
export default class FirmwareUpdateDialog extends DialogBase {
  busy = false;
  error = '';
  messages: string[] = [];

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  created(): void {
    Vue.$eventbus.addListener({
      id: `${sparkUpdateEvent}__${this.serviceId}`,
      filter: (key, type) => key === this.serviceId && type === sparkUpdateEvent,
      onmessage: ({ data }) => data.forEach(v => this.pushMessage(v)),
    });
  }

  beforeDestroy(): void {
    Vue.$eventbus.removeListener(`${sparkUpdateEvent}__${this.serviceId}`);
  }

  get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  get status(): SparkStatus | null {
    return this.sparkModule.status;
  }

  get updateAvailableText(): string {
    return !this.status
      ? 'Current firmware version is unknown.'
      : !this.status.latest
        ? 'A firmware update is available.'
        : "You're using the latest firmware.";
  }

  get buttonEnabled(): boolean {
    return this.status !== null && this.status.connect;
  }

  get buttonColor(): string {
    return this.status?.latest
      ? ''
      : 'primary';
  }

  pushMessage(msg: string): void {
    this.$set(this.messages, this.messages.length, msg);
  }

  updateFirmware(): void {
    this.busy = true;
    this.error = '';
    this.messages = [];

    this.sparkModule
      .flashFirmware()
      .catch(e => { this.error = e.message; })
      .finally(() => { this.busy = false; });
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="serviceId" subtitle="Firmware update" />
      </template>

      <q-card-section>
        <div v-if="error" class="text-negative q-pa-md">
          <div>Update failed: {{ error }}</div>
          If retrying the update does not work, please run 'brewblox-ctl flash'
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
          :disable="busy || !buttonEnabled"
          :loading="busy || !buttonEnabled"
          :color="buttonColor"
          unelevated
          label="Flash"
          @click="updateFirmware"
        />
      </template>
    </ActionCardWrapper>
  </q-dialog>
</template>
