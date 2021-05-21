<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';

import { useDialog, useGlobals } from '@/composables';
import { sparkStore } from '@/plugins/spark/store';
import { WifiCipherType, WifiSecurityType, WiFiSettingsBlock } from '@/plugins/spark/types';
import { getWiFiSettingsBlock } from '@/plugins/spark/utils';
import { createDialog } from '@/utils/dialog';
import notify from '@/utils/notify';

const securityOpts: SelectOption<WifiSecurityType>[] = [
  { label: 'Unsecured', value: WifiSecurityType.WLAN_SEC_UNSEC },
  { label: 'WEP', value: WifiSecurityType.WLAN_SEC_WEP },
  { label: 'WPA', value: WifiSecurityType.WLAN_SEC_WPA },
  { label: 'WPA2', value: WifiSecurityType.WLAN_SEC_WPA2 },
  { label: 'Enterprise WPA', value: WifiSecurityType.WLAN_SEC_WPA_ENTERPRISE },
  { label: 'Enterprise WPA2', value: WifiSecurityType.WLAN_SEC_WPA2_ENTERPRISE },
];

const cipherOpts: SelectOption<WifiCipherType>[] = [
  { label: 'Auto', value: WifiCipherType.WLAN_CIPHER_NOT_SET },
  { label: 'AES', value: WifiCipherType.WLAN_CIPHER_AES },
  { label: 'TKIP', value: WifiCipherType.WLAN_CIPHER_TKIP },
  { label: 'AES or TKIP', value: WifiCipherType.WLAN_CIPHER_AES_OR_TKIP },
];

export default defineComponent({
  name: 'SparkWifiMenu',
  props: {
    ...useDialog.props,
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
    } = useDialog.setup();
    const { dense } = useGlobals.setup();
    const busy = ref(false);
    const isPwd = ref(true);
    const values = reactive<WiFiSettingsBlock['data']>({
      ssid: '',
      password: '',
      security: WifiSecurityType.WLAN_SEC_WPA2,
      cipher: WifiCipherType.WLAN_CIPHER_NOT_SET,
      signal: 0,
      ip: '',
    });

    const block = computed<WiFiSettingsBlock>(
      () => getWiFiSettingsBlock(props.serviceId)!,
    );

    async function save(): Promise<void> {
      busy.value = true;
      await sparkStore
        .saveBlock({ ...block.value, data: values })
        .then(() => notify.done('Wifi settings updated!'))
        .finally(() => busy.value = false);
    }

    function showKeyboard(field: 'ssid' | 'password'): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: values[field],
          password: field === 'password',
        },
      })
        .onOk(v => values[field] = v);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      dense,
      values,
      isPwd,
      busy,
      WifiSecurityType,
      securityOpts,
      cipherOpts,
      save,
      showKeyboard,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <Card>
      <template #toolbar>
        <Toolbar :title="serviceId" subtitle="Wifi Configuration" />
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
    </Card>
  </q-dialog>
</template>
