<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { typeMatchFilter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { sparkStore } from '@/plugins/spark/store';
import { BlockType, WifiCipherType, WifiSecurityType, WiFiSettingsBlock } from '@/plugins/spark/types';

@Component
export default class SparkWifiMenu extends DialogBase {
  WifiCipherType = WifiCipherType;
  WifiSecurityType = WifiSecurityType;

  securityOpts: SelectOption<WifiSecurityType>[] = [
    { label: 'Unsecured', value: WifiSecurityType.WLAN_SEC_UNSEC },
    { label: 'WEP', value: WifiSecurityType.WLAN_SEC_WEP },
    { label: 'WPA', value: WifiSecurityType.WLAN_SEC_WPA },
    { label: 'WPA2', value: WifiSecurityType.WLAN_SEC_WPA2 },
    { label: 'Enterprise WPA', value: WifiSecurityType.WLAN_SEC_WPA_ENTERPRISE },
    { label: 'Enterprise WPA2', value: WifiSecurityType.WLAN_SEC_WPA2_ENTERPRISE },
  ];

  cipherOpts: SelectOption<WifiCipherType>[] = [
    { label: 'Auto', value: WifiCipherType.WLAN_CIPHER_NOT_SET },
    { label: 'AES', value: WifiCipherType.WLAN_CIPHER_AES },
    { label: 'TKIP', value: WifiCipherType.WLAN_CIPHER_TKIP },
    { label: 'AES or TKIP', value: WifiCipherType.WLAN_CIPHER_AES_OR_TKIP },
  ];

  busy = false;
  isPwd = true;
  values: WiFiSettingsBlock['data'] = {
    ssid: '',
    password: '',
    security: WifiSecurityType.WLAN_SEC_WPA2,
    cipher: WifiCipherType.WLAN_CIPHER_NOT_SET,
    signal: 0,
    ip: '',
  }

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get block(): WiFiSettingsBlock {
    return sparkStore.serviceBlocks(this.serviceId)
      .find(typeMatchFilter<WiFiSettingsBlock>(BlockType.WiFiSettings))!;
  }

  async save(): Promise<void> {
    this.busy = true;
    await sparkStore
      .saveBlock({ ...this.block, data: this.values })
      .then(() => notify.done('Wifi settings updated!'))
      .finally(() => this.busy = false);
  }

  showKeyboard(field: 'ssid' | 'password'): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.values[field],
      password: field === 'password',
    })
      .onOk(v => this.values[field] = v);
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
            <q-input
              v-model="values.ssid"
              label="SSID"
              autofocus
            >
              <template #append>
                <KeyboardButton @click="showKeyboard('ssid')" />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input
              v-model="values.password"
              :disable="values.security === WifiSecurityType.WLAN_SEC_UNSEC"
              :type="isPwd ? 'password' : 'text'"
              label="Password"
            >
              <template #append>
                <KeyboardButton @click="showKeyboard('password')" />
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
        <q-btn
          flat
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          :loading="busy"
          unelevated
          label="Connect"
          color="primary"
          @click="save"
        />
      </template>
    </ActionCardWrapper>
  </q-dialog>
</template>
