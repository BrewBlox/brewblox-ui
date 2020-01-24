<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkStore } from '@/plugins/spark/store';
import { SystemStatus } from '@/plugins/spark/types';
import { Service, serviceStore } from '@/store/services';


@Component
export default class FirmwareUpdateDialog extends DialogBase {
  busy = false;
  messages: string[] = [];

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service(): Service {
    return serviceStore.serviceById(this.serviceId);
  }

  get status(): SystemStatus | null {
    return sparkStore.lastStatus(this.serviceId);
  }

  get updateAvailableText(): string {
    return !this.status
      ? 'Current firmware version is unknown.'
      : !this.status.latest
        ? 'A firmware update is available.'
        : "You're using the latest firmware.";
  }

  get buttonEnabled(): boolean {
    return !!this.status && this.status.connect;
  }

  get buttonColor(): string {
    return (this.status && this.status.latest)
      ? ''
      : 'primary';
  }

  pushMessage(msg: string): void {
    this.$set(this.messages, this.messages.length, msg);
  }

  updateFirmware(): void {
    this.busy = true;
    this.messages = [];
    this.pushMessage('Starting update...');

    sparkStore.flashFirmware(this.serviceId)
      .then(() => {
        this.pushMessage('Update complete!');
      })
      .catch(e => {
        this.pushMessage(`Update failed: ${e.toString()}`);
        this.pushMessage('This feature is still experimental.');
        this.pushMessage(`If retrying the update does not work,
                          or your firmware is older than 2019-07-18,
                          please run 'brewblox-ctl flash' to enable UI firmware updates.`);
        if (this.status) {
          this.status.info.forEach(this.pushMessage);
        }
      })
      .finally(() => {
        this.busy = false;
        sparkStore.fetchServiceStatus(this.serviceId);
      });
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="service.id" subtitle="Firmware update" />
      </template>

      <q-card-section>
        <q-item>
          <q-item-section>{{ updateAvailableText }}</q-item-section>
        </q-item>
        <q-list dense>
          <q-item v-for="(msg, idx) in messages" :key="idx">
            <q-item-section>{{ msg }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <template #actions>
        <q-btn
          :disable="!buttonEnabled"
          :loading="busy"
          :color="buttonColor"
          unelevated
          label="Flash"
          @click="updateFirmware"
        />
      </template>
    </ActionCardWrapper>
  </q-dialog>
</template>
