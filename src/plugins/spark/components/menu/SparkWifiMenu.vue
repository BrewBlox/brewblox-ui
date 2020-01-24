<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { blockTypes, WiFiSettingsBlock } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';

@Component
export default class SparkWifiMenu extends DialogBase {
  securityOpts: SelectOption[] = [
    { label: 'Unsecured', value: 0 },
    { label: 'WEP', value: 1 },
    { label: 'WPA', value: 2 },
    { label: 'WPA2', value: 3 },
    { label: 'Enterprise WPA', value: 4 },
    { label: 'Enterprise WPA2', value: 5 },
    // { label: 'Not set', value: 255 },
  ];

  cipherOpts: SelectOption[] = [
    { label: 'Auto', value: 0 },
    { label: 'AES', value: 1 },
    { label: 'TKIP', value: 2 },
    { label: 'AES or TKIP', value: 3 },
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
    return sparkStore.blockValues(this.serviceId)
      .find(block => block.type === blockTypes.WiFiSettings) as WiFiSettingsBlock;
  }

  async save(): Promise<void> {
    await sparkStore.saveBlock([this.serviceId, { ...this.block, data: this.values }]);
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
