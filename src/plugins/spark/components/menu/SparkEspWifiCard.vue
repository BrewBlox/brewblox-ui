<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SparkEspWifiCard',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  emits: ['cancel'],
  setup() {},
});
</script>

<template>
  <Card>
    <template #toolbar>
      <Toolbar
        :title="serviceId"
        subtitle="Wifi Configuration"
      />
    </template>
    <q-card-section class="text-weight-light">
      <p class="text-h5">Setting up Wifi on a Spark 4</p>
      <p>
        Wifi credentials for the Spark 4 are set over Bluetooth, using the
        <b>ESP BLE Provisioning</b> app. The app is available for both Android
        and iOS.
      </p>
      <p>To set Wifi credentials:</p>
      <ul>
        <li>Press the <b>(R)ESET</b> button on your Spark.</li>
        <li>
          While the Spark restarts, press and hold the
          <b>OK</b> button for five seconds. <br />
        </li>
        <li>
          The Spark is ready for provisioning if its buttons are blinking blue.
        </li>
        <li>Download the <b>ESP BLE Provisioning</b> app.</li>
        <li>Enable Bluetooth in your phone settings.</li>
        <li>Open the app.</li>
        <li>Click <b>Provision New Device</b>.</li>
        <li>Click <b>I don't have a QR code</b>.</li>
        <li>Select the <b>PROV_BREWBLOX_</b> device.</li>
        <li>Select your Wifi network, and enter your credentials.</li>
      </ul>
      <p>
        The app will now set Wifi credentials for your Spark. An additional IP
        address will be shown in the top left corner of the Spark display.
      </p>
    </q-card-section>
    <template #actions>
      <q-space />
      <q-btn
        flat
        label="Close"
        @click="$emit('cancel')"
      />
    </template>
  </Card>
</template>
