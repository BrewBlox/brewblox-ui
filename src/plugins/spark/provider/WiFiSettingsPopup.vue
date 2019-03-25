<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { deepCopy } from '@/helpers/shadow-copy';
import { WlanSecurityEnum, WlanCipherEnum } from './getters';

@Component({
  props: {
    field: {
      type: Object,
      required: false,
    },
    change: {
      type: Function,
      required: true,
    },
  },
})
export default class WiFiSettingsPopup extends Vue {
  localCopy: any = null;

  get values() {
    if (this.localCopy === null) {
      this.localCopy = deepCopy(this.$props.field);
    }
    return this.localCopy;
  }

  get securityOpts() {
    return WlanSecurityEnum
      .filter(([i]) => i !== 255) // not set
      .map(([i, s]) => ({ label: s, value: i }));
  }

  get cipherOpts() {
    return WlanCipherEnum
      .map(([i, s]) => ({ label: s, value: i }));
  }

  save() {
    this.$props.change(this.values);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <q-bar class="row items-center bg-primary q-py-lg">
      WiFi Settings
      <q-space/>
      <q-btn v-close-popup flat rounded label="close"/>
    </q-bar>

    <q-card-section>
      <q-item dark>
        <q-item-section>SSID</q-item-section>
        <q-item-section>
          <q-input v-model="values.ssid" dark/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Security</q-item-section>
        <q-item-section>
          <q-select v-model="values.security" :options="securityOpts" dark/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Password</q-item-section>
        <q-item-section>
          <q-input v-model="values.password" :disable="values.security === 0" type="password" dark/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Cipher</q-item-section>
        <q-item-section>
          <q-select v-model="values.cipher" :options="cipherOpts" dark/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section/>
        <q-item-section side>
          <q-btn v-close-popup color="primary" label="connect" @click="save"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
