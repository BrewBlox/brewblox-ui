<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { sparkStore } from '@/plugins/spark/store';
import { serviceStore } from '@/store/services';



@Component
export default class FirmwareUpdateDialog extends DialogBase {
  busy: boolean = false;
  messages: string[] = [];

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service() {
    return serviceStore.serviceById(this.serviceId);
  }

  get status() {
    return sparkStore.lastStatus(this.serviceId);
  }

  get updateAvailableText() {
    return !this.status
      ? 'Current firmware version is unknown.'
      : !this.status.latest
        ? 'A firmware update is available.'
        : "You're using the latest firmware.";
  }

  pushMessage(msg: string) {
    this.$set(this.messages, this.messages.length, msg);
  }

  updateFirmware() {
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
    <q-card dark class="widget-modal">
      <DialogToolbar @close="onDialogHide">
        <q-item-section>
          <q-item-label>{{ service.id }}</q-item-label>
          <q-item-label caption>Firmware update</q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-card-section>
        <q-item dark>
          <q-item-section>{{ updateAvailableText }}</q-item-section>
        </q-item>
        <q-list dark dense>
          <q-item v-for="(msg, idx) in messages" :key="idx" dark>
            <q-item-section>{{ msg }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator dark />
      <q-card-actions align="right">
        <q-btn :loading="busy" unelevated color="primary" label="Flash" @click="updateFirmware" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
