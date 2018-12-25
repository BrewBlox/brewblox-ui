<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

@Component({
  props: {
    field: {
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
  },
})
export default class ActuatorState extends Vue {
  get state() {
    return [
      'Inactive',
      'Active',
    ];
  }

  get stringState() {
    return this.state[this.$props.field] || 'Unknown';
  }

  get boolState() {
    return this.stringState === 'Active';
  }

  set boolState(v: boolean) {
    this.$props.change(v ? 1 : 0);
  }
}
</script>

<template>
  <div>
    <q-toggle v-if="stringState !== 'Unknown'" v-model="boolState"/>
    <div v-else>
      <q-btn
        class="reset-button"
        dense
        no-caps
        flat
        color="warning"
        @click="boolState = false"
      >Unknown state!
        <q-tooltip>
          Click to try to set to
          <i>inactive</i>
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style>
</style>
