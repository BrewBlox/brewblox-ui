<script lang="ts">
import shortid from 'shortid';
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
  id: string = '';
  messages: string[] = [];

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  created(): void {
    this.id = `${sparkUpdateEvent}:${this.serviceId}:${shortid.generate()}`;
    Vue.$eventbus.addStateListener({
      id: this.id,
      filter: (key, type) => key === this.serviceId && type === sparkUpdateEvent,
      onmessage: ({ data }) => data.forEach(v => this.pushMessage(v)),
    });
  }

  beforeDestroy(): void {
    if (this.id) {
      Vue.$eventbus.removeStateListener(this.id);
    }
  }

  get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  get status(): SparkStatus | null {
    return this.sparkModule.status;
  }

  get updateAvailableText(): string {
    const latest = this.status?.isLatestFirmware;
    return latest === undefined
      ? 'Current firmware version is unknown.'
      : latest
        ? "You're using the latest firmware."
        : 'A firmware update is available.';
  }

  get ready(): boolean {
    return !!this.status?.isConnected;
  }

  get buttonColor(): string {
    return this.status?.isLatestFirmware
      ? ''
      : 'primary';
  }

  pushMessage(msg: string): void {
    this.$set(this.messages, this.messages.length, msg);
  }

  updateFirmware(): void {
    if (this.busy || !this.ready) {
      return;
    }
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
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="updateFirmware"
  >
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="serviceId" subtitle="Firmware update" />
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
    </ActionCardWrapper>
  </q-dialog>
</template>
