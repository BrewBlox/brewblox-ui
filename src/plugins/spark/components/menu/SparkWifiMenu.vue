<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { typeMatchFilter } from '@/helpers/functional';
import { sparkStore } from '@/plugins/spark/store';
import { WifiCipherType, WifiSecurityType, WiFiSettingsBlock } from '@/plugins/spark/types';

@Component
export default class SparkWifiMenu extends DialogBase {
  securityOpts: SelectOption<WifiSecurityType>[] = [
    { label: 'Unsecured', value: 'WLAN_SEC_UNSEC' },
    { label: 'WEP', value: 'WLAN_SEC_WEP' },
    { label: 'WPA', value: 'WLAN_SEC_WPA' },
    { label: 'WPA2', value: 'WLAN_SEC_WPA2' },
    { label: 'Enterprise WPA', value: 'WLAN_SEC_WPA_ENTERPRISE' },
    { label: 'Enterprise WPA2', value: 'WLAN_SEC_WPA2_ENTERPRISE' },
  ];

  cipherOpts: SelectOption<WifiCipherType>[] = [
    { label: 'Auto', value: 'WLAN_CIPHER_NOT_SET' },
    { label: 'AES', value: 'WLAN_CIPHER_AES' },
    { label: 'TKIP', value: 'WLAN_CIPHER_TKIP' },
    { label: 'AES or TKIP', value: 'WLAN_CIPHER_AES_TKIP' },
  ];

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
    return sparkStore.serviceBlocks(this.serviceId)
      .find(typeMatchFilter<WiFiSettingsBlock>('WiFiSettings'))!;
  }

  async save(): Promise<void> {
    await sparkStore.saveBlock({ ...this.block, data: this.values });
    this.onDialogOk();
  }
}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="serviceId" subtitle="Wifi Configuration" />
      </template>

      <q-card-section>
        <q-item>
          <q-item-section>
            <q-input v-model="values.ssid" label="SSID" autofocus />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-select
              v-model="values.security"
              :options="securityOpts"
              label="Security"
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input
              v-model="values.password"
              :disable="values.security === 0"
              :type="isPwd ? 'password' : 'text'"
              label="Password"
            >
              <template #append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-select
              v-model="values.cipher"
              :options="cipherOpts"
              label="Cipher"
              map-options
              emit-value
            />
          </q-item-section>
        </q-item>
      </q-card-section>
      <template #actions>
        <q-btn flat label="Cancel" @click="onDialogCancel" />
        <q-space />
        <q-btn unelevated label="Connect" color="primary" @click="save" />
      </template>
    </ActionCardWrapper>
  </q-dialog>
</template>
