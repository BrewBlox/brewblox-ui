<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>OneWireTempSensor ({{ id }})</q-card-title>

    <q-card-main>
      <p class="text-weight-medium">Settings</p>
      <div>
        <span>address</span><span>{{ settings.address }}</span>
        <q-btn
        label="Example button" />
      </div>
      <div>
        <span>offset</span><span>{{ settings.offset }}</span>
        <q-btn
          @click="createMessage(`primary`)"
          label="primary" />
        <q-btn
          @click="createMessage(`secondary`)"
          label="secondary" />
        <q-btn
          @click="createMessage(`tertiary`)"
          label="tertiary" />
        <q-btn
          @click="createMessage(`warning`)"
          label="Warning" />
        <q-btn
          @click="createMessage(`positive`)"
          label="Positive" />
        <q-btn
          @click="createMessage(`negative`)"
          label="Negative" />
        <q-btn
          @click="createMessage(`info`)"
          label="Info" />
      </div>
      <q-field
        label="slider"
        dark>
        <q-slider
        label/>
      </q-field>
      <q-checkbox
        dark
        v-model="checked"
        label="Checkbox Label" />
      <q-chips-input
        dark
        v-model="names"
        float-label="Floating Label" />
      <q-radio
        dark
        v-model="option"
        val="opt3"
        label="Option 3" />
      <q-select
        dark
        v-model="select"
        :options="options" />
      <q-select
        dark
        v-model="select"
        :options="options" />
    </q-card-main>

    <q-card-separator />

    <q-card-main>
      <p class="text-weight-medium">State</p>
      <div>
        <span>value</span><span>{{ state.value }}</span>
      </div>
      <div>
        <span>connected</span><span>{{ state.connected }}</span>
      </div>
    </q-card-main>
  </q-card>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'one-wire-temp-sensor',
  props: {
    id: String,
    settings: {
      address: String,
      offset: Number,
    },
    state: {
      value: Number,
      connected: Boolean,
    },
  },
  data() {
    return {
      names: ['Jack', 'Jim'],
      option: ['opt1', 'opt2', 'opt3'],
      options: [
        {
          label: 'Google',
          value: 'goog',
        },
        {
          label: 'Facebook',
          value: 'fb',
        },
        {
          label: 'Twitter',
          value: 'twtr',
        },
        {
          label: 'Apple Inc.',
          value: 'appl',
        },
        {
          label: 'Oracle',
          value: 'ora',
        },
      ],
      select: 'fb',
      checked: Boolean,
    };
  },
  methods: {
    createMessage(typeOfMessage) {
      this.$q.notify({
        message: `color: ${typeOfMessage}`,
        color: typeOfMessage });
    },
  },
});
</script>

<style scoped>

</style>
