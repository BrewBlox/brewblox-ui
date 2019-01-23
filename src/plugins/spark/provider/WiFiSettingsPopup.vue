<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { deepCopy } from '@/helpers/shadow-copy';
import { WlanSecurityEnum, WlanCipherEnum } from './getters';

@Component({
  props: {
    field: {
      type: String,
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
      .filter(([i, s]) => i !== 255) // not set
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
  <div class="widget-modal">
    <div class="row" style="position: absolute; right: 18px; top: 18px">
      <q-btn v-close-overlay rounded label="close" class="col"/>
      <q-btn v-close-overlay rounded color="primary" label="connect" class="col" @click="save"/>
    </div>
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="SSID">
          <q-input v-model="values.ssid"/>
        </q-field>
        <q-field class="col" label="Password">
          <q-input v-model="values.password" :disable="values.security === 0" type="password"/>
        </q-field>
        <q-field class="col" label="Security">
          <q-select v-model="values.security" :options="securityOpts"/>
        </q-field>
        <q-field class="col" label="Cipher">
          <q-select v-model="values.cipher" :options="cipherOpts"/>
        </q-field>
      </q-card-main>
    </q-card>
  </div>
</template>
