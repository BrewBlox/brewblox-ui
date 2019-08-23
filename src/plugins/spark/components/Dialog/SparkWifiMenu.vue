<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { WiFiSettingsBlock } from '@/plugins/spark/provider/types';
import { sparkStore } from '@/plugins/spark/store';

const WlanSecurityEnum = [
  [0, 'Unsecured'],
  [1, 'WEP'],
  [2, 'WPA'],
  [3, 'WPA2'],
  [4, 'Enterprise WPA'],
  [5, 'Enterprise WPA2'],
  [255, 'Not Set'],
];

const WlanCipherEnum = [
  [0, 'Auto'],
  [1, 'AES'],
  [2, 'TKIP'],
  [3, 'AES or TKIP'],
];

@Component
export default class SparkWifiMenu extends DialogBase {
  isPwd = true;
  values = {
    ssid: '',
    password: '',
    security: 3,
    cipher: 0,
    signal: 0,
    ip: '',
  }

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get block(): WiFiSettingsBlock {
    return sparkStore.blockValues(this.serviceId)
      .find(block => block.type === 'WiFiSettings') as WiFiSettingsBlock;
  }

  get securityOpts() {
    return WlanSecurityEnum
      .filter(([i]) => i !== 255) // not set
      .map(([value, label]) => ({ label, value }));
  }

  get cipherOpts() {
    return WlanCipherEnum
      .map(([value, label]) => ({ label, value }));
  }

  async save() {
    await sparkStore.saveBlock([this.serviceId, { ...this.block, data: this.values }]);
    this.$nextTick(() => this.$emit('close'));
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="widget-modal">
      <DialogToolbar @close="onDialogHide">
        <q-item-section>
          <q-item-label>{{ serviceId }}</q-item-label>
          <q-item-label caption>
            Wifi Configuration
          </q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-card-section>
        <q-item dark>
          <q-item-section>SSID</q-item-section>
          <q-item-section>
            <q-input v-model="values.ssid" dark />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Security</q-item-section>
          <q-item-section>
            <q-select
              v-model="values.security"
              :options="securityOpts"
              emit-value
              map-options
              options-dark
              dark
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Password</q-item-section>
          <q-item-section>
            <q-input
              v-model="values.password"
              :disable="values.security === 0"
              :type="isPwd ? 'password' : 'text'"
              dark
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Cipher</q-item-section>
          <q-item-section>
            <q-select
              v-model="values.cipher"
              :options="cipherOpts"
              dark
              options-dark
              map-options
              emit-value
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section />
          <q-item-section side>
            <q-btn v-close-popup color="primary" label="connect" @click="save" />
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
