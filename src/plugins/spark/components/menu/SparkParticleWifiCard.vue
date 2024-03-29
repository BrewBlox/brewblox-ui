<script setup lang="ts">
import {
  WifiCipherType,
  WifiSecurityType,
  WiFiSettingsBlock,
} from 'brewblox-proto/ts';
import { computed, reactive, ref } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { getWiFiSettingsBlock } from '@/plugins/spark/utils/system';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';

interface Props {
  serviceId: string;
}

const props = defineProps<Props>();

defineEmits<{
  cancel: [];
}>();

const securityOpts: SelectOption<WifiSecurityType>[] = [
  { label: 'Unsecured', value: WifiSecurityType.WLAN_SEC_UNSEC },
  { label: 'WEP', value: WifiSecurityType.WLAN_SEC_WEP },
  { label: 'WPA', value: WifiSecurityType.WLAN_SEC_WPA },
  { label: 'WPA2', value: WifiSecurityType.WLAN_SEC_WPA2 },
  { label: 'Enterprise WPA', value: WifiSecurityType.WLAN_SEC_WPA_ENTERPRISE },
  {
    label: 'Enterprise WPA2',
    value: WifiSecurityType.WLAN_SEC_WPA2_ENTERPRISE,
  },
];

const cipherOpts: SelectOption<WifiCipherType>[] = [
  { label: 'Auto', value: WifiCipherType.WLAN_CIPHER_NOT_SET },
  { label: 'AES', value: WifiCipherType.WLAN_CIPHER_AES },
  { label: 'TKIP', value: WifiCipherType.WLAN_CIPHER_TKIP },
  { label: 'AES or TKIP', value: WifiCipherType.WLAN_CIPHER_AES_OR_TKIP },
];

const sparkStore = useSparkStore();
const busy = ref(false);
const isPwd = ref(true);
const values = reactive<WiFiSettingsBlock['data']>({
  ssid: '',
  password: '',
  security: WifiSecurityType.WLAN_SEC_WPA2,
  cipher: WifiCipherType.WLAN_CIPHER_NOT_SET,
  signal: 0,
});

const block = computed<WiFiSettingsBlock>(
  () => getWiFiSettingsBlock(props.serviceId)!,
);

async function save(): Promise<void> {
  busy.value = true;
  await sparkStore
    .patchBlock(block.value, values)
    .then(() => notify.done('Wifi settings updated!'))
    .finally(() => (busy.value = false));
}

function showKeyboard(field: 'ssid' | 'password'): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: values[field],
      password: field === 'password',
    },
  }).onOk((v) => (values[field] = v));
}
</script>

<template>
  <Card>
    <template #toolbar>
      <Toolbar
        :title="serviceId"
        subtitle="Wifi Configuration"
      />
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
        @click="$emit('cancel')"
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
</template>
