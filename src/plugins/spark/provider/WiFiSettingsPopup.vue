<script lang="ts">
import Component from 'vue-class-component';
import FormBase from '@/components/Widget/FormBase';
import { deepCopy } from '@/helpers/shadow-copy';
import { WlanSecurityEnum, WlanCipherEnum } from './getters';

@Component
export default class WiFiSettingsPopup extends FormBase {
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
      <q-btn rounded v-close-overlay label="close" class="col"/>
      <q-btn rounded v-close-overlay color="primary" label="connect" class="col" @click="save"/>
    </div>
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="SSID">
          <q-input v-model="values.ssid"/>
        </q-field>
        <q-field class="col" label="Password">
          <q-input type="password" v-model="values.password" :disable="values.security === 0"/>
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

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

